from typing import List, Dict, Any
from app.core.config import settings

class RecursiveCharacterSplitter:
    """A recursive character text splitter that splits text on standard boundaries.
    
    This replaces LangChain's text splitter to make the splitting mechanics
    transparent, easy to explain, and free of library overhead.
    """

    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 100, separators: List[str] = None):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = separators or ["\n\n", "\n", " ", ""]

    def split_text(self, text: str) -> List[str]:
        """Splits a single block of text into overlapping chunks recursively."""
        return self._split(text, self.separators)

    def _split(self, text: str, separators: List[str]) -> List[str]:
        """Helper method that selects separators and recursively slices text."""
        if len(text) <= self.chunk_size:
            return [text]

        # 1. Select the first separator present in the text
        separator = ""
        next_separators = []
        for i, sep in enumerate(separators):
            if sep == "":
                separator = sep
                next_separators = separators[i+1:]
                break
            if sep in text:
                separator = sep
                next_separators = separators[i+1:]
                break

        # 2. Split the text by the chosen separator
        if separator != "":
            splits = text.split(separator)
        else:
            # Fallback if no separator found: split character by character
            splits = list(text)

        # 3. Recombine split parts into chunks respecting chunk_size and chunk_overlap
        chunks = []
        current_doc = []
        current_len = 0

        for split in splits:
            # If a single split part is still larger than chunk_size, split it recursively
            if len(split) > self.chunk_size:
                # Merge whatever we have in current_doc first
                if current_doc:
                    chunks.append(separator.join(current_doc))
                    current_doc = []
                    current_len = 0
                
                # Recursively split the oversized part
                recursive_splits = self._split(split, next_separators)
                chunks.extend(recursive_splits)
                continue

            # If adding this split exceeds chunk_size, finalize the current chunk
            join_len = len(separator) if current_doc else 0
            if current_len + join_len + len(split) > self.chunk_size:
                if current_doc:
                    chunks.append(separator.join(current_doc))
                
                # Keep items for overlap
                overlap_doc = []
                overlap_len = 0
                # Take items from the end of current_doc for overlap
                for item in reversed(current_doc):
                    item_join_len = len(separator) if overlap_doc else 0
                    if overlap_len + item_join_len + len(item) <= self.chunk_overlap:
                        overlap_doc.insert(0, item)
                        overlap_len += item_join_len + len(item)
                    else:
                        break
                
                current_doc = overlap_doc
                current_len = overlap_len

            # Add split to current chunk accumulator
            join_len = len(separator) if current_doc else 0
            current_doc.append(split)
            current_len += join_len + len(split)

        if current_doc:
            chunks.append(separator.join(current_doc))

        return [c.strip() for c in chunks if c.strip()]


class ChunkingService:
    """Service handling document segmentation into structured database-ready chunks."""

    @classmethod
    def chunk_document(
        cls, 
        pages: List[Dict[str, Any]], 
        document_id: int, 
        user_id: int, 
        chunk_size: int = 700, 
        chunk_overlap: int = 100
    ) -> List[Dict[str, Any]]:
        """Splits extracted page texts into structured chunks.
        
        Returns:
            A list of dictionary schemas representing DocumentChunk records.
        """
        splitter = RecursiveCharacterSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks_records = []
        chunk_index = 0

        for page in pages:
            page_text = page["text"]
            page_num = page["page_number"]
            section_title = page["section_title"]

            # Split the text of the page
            split_texts = splitter.split_text(page_text)

            for split_text in split_texts:
                # Build DB schema representations
                chunks_records.append({
                    "document_id": document_id,
                    "user_id": user_id,
                    "chunk_index": chunk_index,
                    "page_number": page_num,
                    "section_title": section_title,
                    "content": split_text,
                    "token_count": len(split_text) // 4,  # Simple character to token heuristic (4 chars ~ 1 token)
                    "embedding_model": settings.EMBEDDING_MODEL_NAME,
                    "vector_id": f"doc_{document_id}_chunk_{chunk_index}"  # Unique vector key
                })
                chunk_index += 1

        return chunks_records
