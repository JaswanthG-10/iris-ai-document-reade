from typing import List, Dict, Any
from app.extractors.pdf_extractor import PDFExtractor
from app.extractors.docx_extractor import DOCXExtractor
from app.extractors.text_extractor import TXTExtractor
from app.core.exceptions import ProcessingException

class ExtractionService:
    """Orchestration service routing documents to their respective format extractors."""

    # Pre-instantiated parser handlers
    _extractors = {
        "pdf": PDFExtractor(),
        "docx": DOCXExtractor(),
        "txt": TXTExtractor()
    }

    @classmethod
    def extract_text(cls, file_path: str, file_type: str) -> List[Dict[str, Any]]:
        """Invokes the specific format extractor based on the document file type extension.
        
        Returns:
            List of dicts containing page number, section title, and extracted text.
        """
        parser = cls._extractors.get(file_type.lower())
        if not parser:
            raise ProcessingException(f"No text extractor registered for format type: '{file_type}'")
        
        return parser.extract(file_path)
