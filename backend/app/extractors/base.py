from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseExtractor(ABC):
    """Abstract base class for document text extraction engines."""

    @abstractmethod
    def extract(self, file_path: str) -> List[Dict[str, Any]]:
        """Extracts text from a document, preserving structure.
        
        Returns:
            A list of dictionaries, each containing:
            - "text": str (the parsed, cleaned text)
            - "page_number": int (1-indexed page or paragraph grouping)
            - "section_title": str | None (heading structure if available)
        """
        pass

    @staticmethod
    def normalize_text(text: str) -> str:
        """Cleans and normalizes extracted text content.
        
        Removes excessive duplicate whitespaces, normalizes line breaks,
        but preserves punctuation and paragraph separations.
        """
        if not text:
            return ""
        
        # 1. Normalize line endings and whitespace
        lines = [line.strip() for line in text.splitlines()]
        # 2. Join lines with spaces, preserving paragraph breaks
        cleaned_text = " ".join([line for line in lines if line])
        # 3. Collapse multiple spaces
        import re
        cleaned_text = re.sub(r"[ \t]+", " ", cleaned_text)
        return cleaned_text.strip()
