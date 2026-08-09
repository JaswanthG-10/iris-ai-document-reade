import io
from fastapi import status
import pytest
from app.services.retrieval_service import RetrievalService
from app.services.document_service import DocumentService
from app.core.config import settings

@pytest.fixture
def auth_user_a(client):
    """Creates User A and returns login headers."""
    payload = {"name": "User A", "email": "a@example.com", "password": "passwordA"}
    client.post("/api/v1/auth/register", json=payload)
    login = client.post("/api/v1/auth/login", data={"username": payload["email"], "password": payload["password"]})
    return {"headers": {"Authorization": f"Bearer {login.json()['access_token']}"}, "id": 1}

@pytest.fixture
def auth_user_b(client):
    """Creates User B and returns login headers."""
    payload = {"name": "User B", "email": "b@example.com", "password": "passwordB"}
    client.post("/api/v1/auth/register", json=payload)
    login = client.post("/api/v1/auth/login", data={"username": payload["email"], "password": payload["password"]})
    return {"headers": {"Authorization": f"Bearer {login.json()['access_token']}"}, "id": 2}

def test_rag_end_to_end_retrieval(client, auth_user_a):
    """Tests the full RAG pipeline: upload, parse, chunk, embed, and retrieve."""
    # 1. Ingest document
    file_content = b"The capital of France is Paris. Paris is a major European city and a global center for art and fashion."
    res = client.post(
        "/api/v1/documents",
        headers=auth_user_a["headers"],
        files={"file": ("france.txt", io.BytesIO(file_content), "text/plain")}
    )
    assert res.status_code == status.HTTP_201_CREATED
    doc_id = res.json()["id"]
    
    # 2. Retrieve context for query
    results = RetrievalService.retrieve_context(
        user_id=auth_user_a["id"],
        query="What is the capital of France?",
        selected_doc_ids=[doc_id],
        top_k=3,
        similarity_threshold=0.2
    )
    
    assert len(results) > 0
    assert "Paris" in results[0]["content"]
    assert results[0]["document_id"] == doc_id
    assert results[0]["relevance_score"] > 0.2

def test_rag_tenant_isolation(client, auth_user_a, auth_user_b):
    """Tests that User B cannot retrieve chunks belonging to User A's documents."""
    # 1. User A uploads file
    file_content = b"The secret password is 'Antigravity99'."
    client.post(
        "/api/v1/documents",
        headers=auth_user_a["headers"],
        files={"file": ("secret.txt", io.BytesIO(file_content), "text/plain")}
    )
    
    # 2. User B queries context
    results = RetrievalService.retrieve_context(
        user_id=auth_user_b["id"],
        query="What is the secret password?",
        selected_doc_ids=None,
        top_k=3,
        similarity_threshold=0.1
    )
    
    # User B should retrieve absolutely 0 chunks since they have no uploaded documents
    assert len(results) == 0

def test_rag_document_scoping_filter(client, auth_user_a):
    """Tests that RAG queries can be restricted to specific document subsets."""
    # 1. Upload Doc A (Germany)
    client.post(
        "/api/v1/documents",
        headers=auth_user_a["headers"],
        files={"file": ("germany.txt", io.BytesIO(b"Berlin is the capital of Germany."), "text/plain")}
    )
    
    # 2. Upload Doc B (Italy)
    res_b = client.post(
        "/api/v1/documents",
        headers=auth_user_a["headers"],
        files={"file": ("italy.txt", io.BytesIO(b"Rome is the capital of Italy."), "text/plain")}
    )
    doc_b_id = res_b.json()["id"]

    # 3. Query Italy specifically
    results = RetrievalService.retrieve_context(
        user_id=auth_user_a["id"],
        query="Where is the capital of Germany or Italy?",
        selected_doc_ids=[doc_b_id],
        top_k=5,
        similarity_threshold=0.1
    )
    
    # The output should contain Italy chunks but NOT Germany chunks
    assert len(results) > 0
    assert all(c["document_id"] == doc_b_id for c in results)
    assert any("Rome" in c["content"] for c in results)
    assert not any("Berlin" in c["content"] for c in results)

def test_rag_similarity_threshold_filtering(client, auth_user_a):
    """Tests that low relevance candidates are filtered out by high thresholds."""
    client.post(
        "/api/v1/documents",
        headers=auth_user_a["headers"],
        files={"file": ("ai.txt", io.BytesIO(b"Artificial Intelligence is transforming software development."), "text/plain")}
    )
    
    # Query completely unrelated text with high threshold
    results = RetrievalService.retrieve_context(
        user_id=auth_user_a["id"],
        query="How do you make chocolate cookies?",
        selected_doc_ids=None,
        top_k=5,
        similarity_threshold=0.99  # Very high threshold
    )
    
    assert len(results) == 0


def test_create_and_manage_conversations(client, auth_user_a):
    """Tests conversation thread lifecycle CRUD operations."""
    # 1. Create Conversation
    response = client.post(
        "/api/v1/chat/conversations",
        headers=auth_user_a["headers"],
        json={"title": "Test Chat"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    conv_id = response.json()["id"]
    assert response.json()["title"] == "Test Chat"

    # 2. List Conversations
    list_res = client.get("/api/v1/chat/conversations", headers=auth_user_a["headers"])
    assert list_res.status_code == status.HTTP_200_OK
    assert len(list_res.json()) >= 1
    assert list_res.json()[0]["id"] == conv_id

    # 3. Rename Conversation
    rename_res = client.patch(
        f"/api/v1/chat/conversations/{conv_id}",
        headers=auth_user_a["headers"],
        json={"title": "Renamed Chat"}
    )
    assert rename_res.status_code == status.HTTP_200_OK
    assert rename_res.json()["title"] == "Renamed Chat"

    # 4. Delete Conversation
    del_res = client.delete(f"/api/v1/chat/conversations/{conv_id}", headers=auth_user_a["headers"])
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # 5. Verify it's gone
    list_res_empty = client.get("/api/v1/chat/conversations", headers=auth_user_a["headers"])
    assert not any(c["id"] == conv_id for c in list_res_empty.json())


from unittest.mock import patch, MagicMock

@patch("httpx.post")
def test_submit_question_grounded_qa(mock_post, client, auth_user_a, monkeypatch):
    """Tests query submission, mocking Gemini REST API calls, and parses citations."""
    # 1. Ensure Gemini API Key is mocked
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "mocked_gemini_api_key")

    # 2. Upload text document containing context
    file_content = b"The capital of France is Paris."
    res_upload = client.post(
        "/api/v1/documents",
        headers=auth_user_a["headers"],
        files={"file": ("france.txt", io.BytesIO(file_content), "text/plain")}
    )
    doc_id = res_upload.json()["id"]

    # 3. Create Conversation
    res_conv = client.post(
        "/api/v1/chat/conversations",
        headers=auth_user_a["headers"],
        json={"title": "France Chat"}
    )
    conv_id = res_conv.json()["id"]

    # 4. Setup mock Gemini response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "text": "Based on documents, Paris is the capital of France [Doc-0]."
                        }
                    ]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    # 5. Submit user message
    res_msg = client.post(
        f"/api/v1/chat/conversations/{conv_id}/messages",
        headers=auth_user_a["headers"],
        json={
            "content": "What is the capital of France?",
            "selected_document_ids": [doc_id]
        }
    )

    assert res_msg.status_code == status.HTTP_201_CREATED
    data = res_msg.json()
    assert "Paris is the capital of France" in data["content"]
    assert len(data["sources"]) == 1
    assert data["sources"][0]["document_id"] == doc_id
    assert "capital of France is Paris" in data["sources"][0]["supporting_excerpt"]

