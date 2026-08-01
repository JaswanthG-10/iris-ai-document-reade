import logging
from typing import List, Dict, Any
import fitz  # PyMuPDF
from app.extractors.base import BaseExtractor
from app.core.exceptions import ProcessingException

logger = logging.getLogger("documind")

class PDFExtractor(BaseExtractor):
    """PDF document text extraction engine using PyMuPDF with an inline Tesseract OCR fallback for scanned pages."""

    def extract(self, file_path: str) -> List[Dict[str, Any]]:
        """Parses a local PDF page by page, returning clean text mapped to page numbers.
        Falls back to OCR if a page contains no extractable text.
        """
        results = []
        try:
            doc = fitz.open(file_path)
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                raw_text = page.get_text()
                cleaned_text = self.normalize_text(raw_text)
                
                # If page is empty, check for scanned content and trigger OCR
                if not cleaned_text:
                    logger.info(f"Page {page_idx + 1} yielded empty text. Attempting Tesseract OCR fallback...")
                    ocr_text = self._attempt_ocr(page)
                    if ocr_text:
                        cleaned_text = self.normalize_text(ocr_text)
                        logger.info(f"Successfully recovered {len(cleaned_text)} characters from page {page_idx + 1} via OCR.")

                # Skip if still empty
                if not cleaned_text:
                    continue
                
                results.append({
                    "text": cleaned_text,
                    "page_number": page_idx + 1,  # 1-indexed for reader display
                    "section_title": None        # Core PDF parsing doesn't auto-resolve headings
                })
            doc.close()
            
            if not results:
                raise ProcessingException("No text could be extracted from the PDF. It may be scanned or empty. Install tesseract-ocr to enable optical character recognition.")
            
            return results
        except ProcessingException:
            raise
        except Exception as e:
            raise ProcessingException(f"Failed parsing PDF file: {str(e)}")

    def _attempt_ocr(self, page) -> str | None:
        """Renders the PDF page to a high-DPI image and runs Tesseract OCR."""
        try:
            import pytesseract
            from PIL import Image
            import io
            
            # Render page to PNG pixmap at 150 DPI for accurate text extraction
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_bytes))

            # Run Tesseract OCR on in-memory image
            text = pytesseract.image_to_string(image)
            return text
            
        except ImportError:
            logger.warning("OCR packages (pytesseract or Pillow) are not installed in the environment. Scanned page OCR fallback skipped.")
            return None
        except Exception as e:
            # Handle cases where Tesseract binary is not installed on OS path
            logger.warning(f"Tesseract OCR engine failed: {str(e)}. Please install tesseract-ocr binary on host system.")
            return None
