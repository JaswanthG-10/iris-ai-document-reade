from typing import List, Dict, Any
import docx
from app.extractors.base import BaseExtractor
from app.core.exceptions import ProcessingException

class DOCXExtractor(BaseExtractor):
    """DOCX Word document text extraction engine using python-docx."""

    def extract(self, file_path: str) -> List[Dict[str, Any]]:
        """Parses a local Word document, organizing paragraphs into virtual pages by heading boundaries and word limits."""
        results = []
        try:
            doc = docx.Document(file_path)
            
            current_section = "General Content"
            accumulated_paras = []
            accumulated_chars = 0
            page_num = 1
            
            for para in doc.paragraphs:
                text = para.text.strip()
                if not text:
                    continue

                style_name = para.style.name if para.style else ""
                
                # Check if this paragraph acts as a section heading (e.g., 'Heading 1', 'Heading 2')
                if style_name.startswith("Heading"):
                    # Emit existing accumulated text before changing section context
                    if accumulated_paras:
                        results.append({
                            "text": self.normalize_text("\n".join(accumulated_paras)),
                            "page_number": page_num,
                            "section_title": current_section
                        })
                        page_num += 1
                        accumulated_paras = []
                        accumulated_chars = 0
                    
                    current_section = text
                else:
                    accumulated_paras.append(text)
                    accumulated_chars += len(text)
                    
                    # Virtual page boundary: Group text into blocks of ~2500 characters
                    if accumulated_chars >= 2500:
                        results.append({
                            "text": self.normalize_text("\n".join(accumulated_paras)),
                            "page_number": page_num,
                            "section_title": current_section
                        })
                        page_num += 1
                        accumulated_paras = []
                        accumulated_chars = 0

            # Emit any remaining text segments at end of file
            if accumulated_paras:
                results.append({
                    "text": self.normalize_text("\n".join(accumulated_paras)),
                    "page_number": page_num,
                    "section_title": current_section
                })

            if not results:
                raise ProcessingException("No text could be extracted from the Word document. The file might be empty.")

            return results
        except ProcessingException:
            raise
        except Exception as e:
            raise ProcessingException(f"Failed parsing DOCX file: {str(e)}")
