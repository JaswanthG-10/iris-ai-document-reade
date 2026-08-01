import re
import logging
import httpx
from typing import List, Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger("documind")

class AnswerService:
    """Service wrapping LLM integration via raw HTTP REST API calls to Gemini API with local fallback."""

    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    @classmethod
    def format_context(cls, chunks: List[Dict[str, Any]]) -> str:
        """Formats retrieved chunks with clear delimitations for prompt-injection defense."""
        formatted_parts = []
        for idx, chunk in enumerate(chunks):
            formatted_parts.append(
                f"--- START DOCUMENT CHUNK [Doc-{idx}] ---\n"
                f"Document ID: {chunk['document_id']}\n"
                f"Page/Section: {chunk['page_number'] if chunk['page_number'] is not None else 'N/A'}\n"
                f"Text Segment:\n{chunk['content']}\n"
                f"--- END DOCUMENT CHUNK [Doc-{idx}] ---\n"
            )
        return "\n".join(formatted_parts)

    @classmethod
    def generate_grounded_answer(
        cls, 
        query: str, 
        chunks: List[Dict[str, Any]]
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """Calls Gemini API with grounding guidelines. If API is unavailable or quota limited, falls back to extractive synthesis."""
        
        answer_text = ""
        citations = []

        if not chunks:
            return "I cannot find any relevant information in the uploaded documents to answer your question.", []

        if settings.GEMINI_API_KEY:
            formatted_context = cls.format_context(chunks)
            system_instruction = (
                "You are Iris AI, a helpful, secure, and expert document understanding assistant.\n"
                "Your task is to answer the user's question using ONLY the provided verified document chunks.\n"
                "Cite every important claim or fact by appending the chunk label (e.g. [Doc-0], [Doc-1]) "
                "directly at the end of the sentence.\n"
                "If the chunks do not contain enough info, state: 'I cannot find the answer in the provided documents.'"
            )

            user_prompt = (
                f"=== RETRIEVED DOCUMENT CONTEXT ===\n"
                f"{formatted_context}\n\n"
                f"=== USER QUESTION ===\n"
                f"{query}\n\n"
                f"Please output your grounded answer with inline citations [Doc-i] now:"
            )

            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_instruction}\n\n{user_prompt}"}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.0,
                    "maxOutputTokens": 1024
                }
            }

            url_params = {"key": settings.GEMINI_API_KEY}

            try:
                logger.info("Sending request to Gemini API generateContent endpoint...")
                response = httpx.post(
                    cls.GEMINI_API_URL,
                    json=payload,
                    params=url_params,
                    timeout=15.0
                )

                if response.status_code == 200:
                    res_json = response.json()
                    answer_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
                    logger.info("Successfully received response from Gemini API.")
                else:
                    logger.warning(f"Gemini API status {response.status_code}: {response.text[:150]}. Falling back to extractive RAG synthesis.")
            except Exception as e:
                logger.warning(f"Gemini API request failed ({str(e)}). Falling back to extractive RAG synthesis.")

        # Fallback to extractive synthesis if LLM API was unavailable, quota-limited, or returned non-200
        if not answer_text:
            top_excerpts = []
            for idx, chunk in enumerate(chunks[:3]):
                snippet = chunk["content"].strip().replace("\n", " ")
                if len(snippet) > 280:
                    snippet = snippet[:280] + "..."
                top_excerpts.append(f"• According to document passage [Doc-{idx}]: \"{snippet}\"")
                citations.append({
                    "document_id": chunk["document_id"],
                    "chunk_id": chunk["vector_id"],
                    "page_number": chunk["page_number"],
                    "relevance_score": chunk["relevance_score"],
                    "supporting_excerpt": chunk["content"]
                })

            answer_text = (
                f"Based on vector semantic search across your indexed documents, here are the most relevant verified passages for **\"{query}\"**:\n\n"
                + "\n\n".join(top_excerpts)
            )

        # Parse inline citations [Doc-i] if LLM answered
        if not citations:
            cited_indices = re.findall(r"\[Doc-(\d+)\]", answer_text)
            unique_indices = sorted(list(set(int(idx) for idx in cited_indices)))

            for idx in unique_indices:
                if idx < len(chunks):
                    chunk = chunks[idx]
                    citations.append({
                        "document_id": chunk["document_id"],
                        "chunk_id": chunk["vector_id"],
                        "page_number": chunk["page_number"],
                        "relevance_score": chunk["relevance_score"],
                        "supporting_excerpt": chunk["content"]
                    })

        return answer_text, citations
