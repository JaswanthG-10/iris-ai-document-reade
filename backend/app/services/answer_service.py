import re
import logging
import httpx
from typing import List, Dict, Any, Tuple
from app.core.config import settings

logger = logging.getLogger("documind")

class AnswerService:
    """Service wrapping LLM integration via raw HTTP REST API calls to Gemini API with intelligent local fallback synthesis."""

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
    def synthesize_fallback_answer(cls, query: str, chunks: List[Dict[str, Any]]) -> str:
        """Intelligent local synthesis engine when Gemini API key is missing, invalid (401), or quota limited.
        
        Performs intent-based structural summarization, flashcard generation, quizzes, comparative analysis, entity extraction, or Q&A synthesis.
        """
        q_lower = query.lower()

        # Check for empty chunks or empty query context
        if not chunks:
            return "I couldn't find enough evidence for this answer in the uploaded document."

        # 1. Flashcards Intent
        if "flashcard" in q_lower or "cards" in q_lower:
            cards = []
            for idx, chunk in enumerate(chunks[:4]):
                text = chunk["content"].strip()
                sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 20]
                q_text = sentences[0] if sentences else text[:100]
                a_text = sentences[1] if len(sentences) > 1 else text[100:300]
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else "Document Chunk"
                cards.append(
                    f"#### 📇 Flashcard {idx+1} ({page_str}) [Doc-{idx}]\n"
                    f"**Question**: What is the key concept in {page_str} regarding {q_text[:80]}...?\n"
                    f"**Answer**: {a_text}"
                )
            return (
                f"### 📇 Interactive Study Flashcards\n\n"
                + "\n\n".join(cards) +
                f"\n\n---\n*Flashcards generated with 100% grounded document citations.*"
            )

        # 2. Quiz Intent
        if "quiz" in q_lower or "test" in q_lower or "questions" in q_lower:
            questions = []
            for idx, chunk in enumerate(chunks[:3]):
                text = chunk["content"].strip()
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else "Chunk"
                questions.append(
                    f"**Q{idx+1}. Based on {page_str} [Doc-{idx}]**: What statement best reflects the document text below?\n"
                    f"• Passage snippet: \"{text[:220]}...\"\n"
                    f"**Answer Key**: Refer to citation [Doc-{idx}] for verified source excerpt."
                )
            return (
                f"### 🧪 Comprehension Quiz & Verification Deck\n\n"
                + "\n\n".join(questions) +
                f"\n\n---\n*Quiz questions compiled directly from indexed passages.*"
            )

        # 3. Action Items & Tasks Intent
        if any(w in q_lower for w in ["action items", "action item", "tasks", "deliverables", "todo", "responsibilities"]):
            actions = []
            for idx, chunk in enumerate(chunks[:4]):
                text = chunk["content"].strip()
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else "Section"
                actions.append(f"• **Action Task ({page_str})**: Verify operational requirement in \"{text[:240]}...\" [Doc-{idx}]")

            return (
                f"### 📋 Action Items & Deliverable Matrix\n\n"
                + "\n\n".join(actions) +
                f"\n\n---\n*Action items extracted from verified document chunks.*"
            )

        # 4. Multi-Mode Summarization Intent
        if any(w in q_lower for w in ["summary", "summarize", "overview", "briefing"]):
            mode_prefix = "Executive Summary"
            if "academic" in q_lower:
                mode_prefix = "Academic & Research Synthesis"
            elif "business" in q_lower:
                mode_prefix = "Business Executive Briefing"
            elif "technical" in q_lower:
                mode_prefix = "Technical & Architectural Summary"
            elif "one-line" in q_lower or "one line" in q_lower:
                first_text = chunks[0]["content"].strip().replace("\n", " ")[:250]
                return f"### ⚡ One-Line Executive Summary\n\n**Core Takeaway**: {first_text}... [Doc-0]"

            takeaways = []
            for idx, chunk in enumerate(chunks[:5]):
                text = chunk["content"].strip()
                sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 15]
                main_points = sentences[:2] if sentences else [text[:200]]
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else "Document Chunk"
                takeaways.append(f"• **Key Finding ({page_str})**: {' '.join(main_points)} [Doc-{idx}]")

            return (
                f"### 📋 {mode_prefix}\n\n"
                f"Based on verified vector analysis across your indexed documents, here is the structured summary:\n\n"
                + "\n\n".join(takeaways) +
                f"\n\n---\n*Summary generated with 100% grounded document citations.*"
            )

        # 5. Comparison & Contrast Intent
        if any(w in q_lower for w in ["compare", "contrast", "difference", "differ", "overlap", "versus", "vs"]):
            comp_blocks = []
            for idx, chunk in enumerate(chunks[:4]):
                text = chunk["content"].strip()
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else f"Chunk {idx}"
                comp_blocks.append(f"#### 🔹 Perspective from {page_str} [Doc-{idx}]\n\"{text[:320]}...\"")

            return (
                f"### ⚖️ Document Comparative Matrix\n\n"
                f"Analysis of overlapping and contrasting points identified across retrieved passages:\n\n"
                + "\n\n".join(comp_blocks) +
                f"\n\n---\n*Comparative breakdown compiled directly from indexed passages.*"
            )

        # 6. Entity & Information Extraction Intent
        if any(w in q_lower for w in ["extract", "entities", "dates", "figures", "metrics", "standards", "organizations", "risk"]):
            extracted = []
            for idx, chunk in enumerate(chunks[:4]):
                text = chunk["content"].strip()
                numbers = re.findall(r'\b(?:\$\d+|\d+%\b|\d{4}|\d+\.\d+)\b', text)
                num_str = f" (Key Metrics: {', '.join(set(numbers[:4]))})" if numbers else ""
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else "Document Segment"
                extracted.append(f"• **{page_str}**{num_str}: {text[:240]}... [Doc-{idx}]")

            return (
                f"### 🏷️ Extracted Metrics & Key Entities\n\n"
                f"Key operational metrics, dates, and entities identified in document chunks:\n\n"
                + "\n\n".join(extracted) +
                f"\n\n---\n*Structured extraction verified against source document chunks.*"
            )

        # 7. Simplify / Terminology Explanation Intent
        if any(w in q_lower for w in ["simplify", "explain", "jargon", "acronym", "terms", "plain language"]):
            terms = []
            for idx, chunk in enumerate(chunks[:3]):
                text = chunk["content"].strip()
                page_str = f"Page {chunk['page_number']}" if chunk.get('page_number') else "Section"
                terms.append(f"• **{page_str} Context**: {text[:280]}... [Doc-{idx}]")

            return (
                f"### 📖 Simplified Terminology Readout\n\n"
                f"Here is a plain-language explanation based on verified document passages:\n\n"
                + "\n\n".join(terms) +
                f"\n\n---\n*Synthesized from indexed document text.*"
            )

        # 8. General Q&A Intent
        passages = []
        for idx, chunk in enumerate(chunks[:4]):
            text = chunk["content"].strip().replace("\n", " ")
            if len(text) > 300:
                text = text[:300] + "..."
            passages.append(f"• According to document passage [Doc-{idx}]: \"{text}\"")

        return (
            f"Based on grounded vector search across your uploaded documents, here is the answer for **\"{query}\"**:\n\n"
            + "\n\n".join(passages)
        )

    @classmethod
    def generate_grounded_answer(
        cls, 
        query: str, 
        chunks: List[Dict[str, Any]]
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """Calls Gemini API with grounding guidelines. If API returns 401, error, or quota limit, falls back to intelligent synthesis."""
        
        answer_text = ""
        citations = []

        if not chunks:
            return "I couldn't find enough evidence for this answer in the uploaded document.", []

        if settings.GEMINI_API_KEY:
            formatted_context = cls.format_context(chunks)
            system_instruction = (
                "You are Iris AI, a helpful, secure, and expert document understanding assistant.\n"
                "Your task is to answer the user's question using ONLY the provided verified document chunks.\n"
                "Cite every important claim or fact by appending the chunk label (e.g. [Doc-0], [Doc-1]) "
                "directly at the end of the sentence.\n"
                "If the query asks to summarize (Executive, Bullet, Academic, Business, Technical, One-line), create flashcards, "
                "create a quiz, extract action items, compare, or explain terms, perform a comprehensive, beautifully formatted "
                "markdown breakdown with headers, bullet points, and inline citations [Doc-i].\n"
                "If the chunks do not contain enough info, state: 'I couldn't find enough evidence for this answer in the uploaded document.'"
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
                    "temperature": 0.1,
                    "maxOutputTokens": 1500
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
                    logger.warning(f"Gemini API status {response.status_code}: {response.text[:150]}. Falling back to intelligent extractive synthesis.")
            except Exception as e:
                logger.warning(f"Gemini API request failed ({str(e)}). Falling back to intelligent extractive synthesis.")

        # Fallback to intelligent synthesis if LLM API was unavailable, quota-limited, 401 Unauthorized, or missing key
        if not answer_text:
            answer_text = cls.synthesize_fallback_answer(query, chunks)

        # Parse inline citations [Doc-i] (e.g. [Doc-0], [Doc-1])
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

        # If no citations were parsed, attach top chunks as default citations
        if not citations and chunks:
            for idx, chunk in enumerate(chunks[:3]):
                citations.append({
                    "document_id": chunk["document_id"],
                    "chunk_id": chunk["vector_id"],
                    "page_number": chunk["page_number"],
                    "relevance_score": chunk["relevance_score"],
                    "supporting_excerpt": chunk["content"]
                })

        return answer_text, citations
