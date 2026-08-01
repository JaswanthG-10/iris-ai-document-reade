from typing import List, Dict, Any
from app.extractors.base import BaseExtractor
from app.core.exceptions import ProcessingException

class TXTExtractor(BaseExtractor):
    """Plain text document extraction engine with UTF-8 / Latin-1 decode fallbacks."""

    def extract(self, file_path: str) -> List[Dict[str, Any]]:
        """Reads a local plain text file and segments it into structured virtual pages of ~2500 characters."""
        results = []
        try:
            # 1. Attempt reading file with UTF-8, fallback to Latin-1
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(file_path, "r", encoding="latin-1") as f:
                    content = f.read()

            if not content.strip():
                raise ProcessingException("The plain text file is empty")

            # 2. Segment long text block into virtual pages
            page_num = 1
            segment_size = 2500
            
            # Simple division based on character slices
            for idx in range(0, len(content), segment_size):
                chunk_slice = content[idx:idx + segment_size].strip()
                if not chunk_slice:
                    continue
                
                results.append({
                    "text": self.normalize_text(chunk_slice),
                    "page_number": page_num,
                    "section_title": "Plain Text"
                })
                page_num += 1

            return results
        except ProcessingException:
            raise
        except Exception as e:
            raise ProcessingException(f"Failed parsing TXT file: {str(e)}")
