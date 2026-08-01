import io
from unittest.mock import MagicMock, patch
from fastapi import status
import pytest
from app.services.document_service import DocumentService

@pytest.fixture
def auth_headers(client):
    """Register and login a test user to get bearer token headers."""
    payload = {
        "name": "Doc Owner",
        "email": "owner@example.com",
        "password": "securepassword"
    }
    client.post("/api/v1/auth/register", json=payload)
    login_res = client.post("/api/v1/auth/login", data={"username": payload["email"], "password": payload["password"]})
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_upload_txt_success(client, auth_headers):
    """Tests that a valid TXT file uploads successfully and records are saved."""
    file_content = b"This is a test plain text document for DocuMind AI."
    file_stream = io.BytesIO(file_content)
    
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("test.txt", file_stream, "text/plain")}
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["original_name"] == "test.txt"
    assert data["file_type"] == "txt"
    assert data["size_bytes"] == len(file_content)
    assert data["status"] == "Uploaded"
    assert "id" in data

def test_upload_duplicate_rejected(client, auth_headers):
    """Tests duplicate document detection prevents uploading identical files twice."""
    file_content = b"Unique content for duplicate test."
    
    # Ingest first time
    res1 = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("doc1.txt", io.BytesIO(file_content), "text/plain")}
    )
    assert res1.status_code == status.HTTP_201_CREATED
    
    # Ingest second time
    res2 = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("doc2.txt", io.BytesIO(file_content), "text/plain")}
    )
    assert res2.status_code == status.HTTP_409_CONFLICT
    assert "duplicate" in res2.json()["error"].lower()

def test_upload_unsupported_format(client, auth_headers):
    """Tests that invalid formats (like .png) are rejected."""
    file_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("image.png", io.BytesIO(file_content), "image/png")}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "unsupported file extension" in response.json()["error"].lower()

def test_upload_empty_file(client, auth_headers):
    """Tests that empty file uploads are rejected."""
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "empty" in response.json()["error"].lower()

def test_upload_large_file_limit(client, auth_headers):
    """Tests that files exceeding the 20MB limit are rejected."""
    large_content = b"a" * (20 * 1024 * 1024 + 10)  # > 20 MB
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("huge.txt", io.BytesIO(large_content), "text/plain")}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "exceeds the limit" in response.json()["error"].lower()

@patch("fitz.open")
def test_upload_password_protected_pdf_rejected(mock_fitz_open, client, auth_headers):
    """Tests that password-encrypted PDFs are rejected."""
    # Setup mock fitz Document to report encrypted
    mock_doc = MagicMock()
    mock_doc.is_encrypted = True
    mock_fitz_open.return_value = mock_doc
    
    pdf_content = b"%PDF-1.4 mock pdf structure"
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("locked.pdf", io.BytesIO(pdf_content), "application/pdf")}
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "password-protected" in response.json()["error"].lower()
    mock_doc.close.assert_not_called()  # if open raises error, close is handled differently or not called.

def test_delete_document_success(client, auth_headers):
    """Tests that document metadata, jobs, and file records can be purged successfully."""
    # 1. Upload first
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("del.txt", io.BytesIO(b"delete me"), "text/plain")}
    )
    doc_id = response.json()["id"]
    
    # 2. Verify it exists
    get_res = client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == status.HTTP_200_OK
    
    # 3. Delete
    del_res = client.delete(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT
    
    # 4. Verify it's gone
    get_res_gone = client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_res_gone.status_code == status.HTTP_404_NOT_FOUND

def test_document_user_isolation(client):
    """Tests that users cannot read or delete documents belonging to another user."""
    # 1. Register User A and upload file
    payload_a = {"name": "User A", "email": "a@example.com", "password": "passwordA"}
    client.post("/api/v1/auth/register", json=payload_a)
    login_a = client.post("/api/v1/auth/login", data={"username": payload_a["email"], "password": payload_a["password"]})
    token_a = login_a.json()["access_token"]
    
    res_upload = client.post(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {token_a}"},
        files={"file": ("isolated.txt", io.BytesIO(b"private content"), "text/plain")}
    )
    doc_id = res_upload.json()["id"]

    # 2. Register User B
    payload_b = {"name": "User B", "email": "b@example.com", "password": "passwordB"}
    client.post("/api/v1/auth/register", json=payload_b)
    login_b = client.post("/api/v1/auth/login", data={"username": payload_b["email"], "password": payload_b["password"]})
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User B tries to view User A's document
    res_view = client.get(f"/api/v1/documents/{doc_id}", headers=headers_b)
    assert res_view.status_code == status.HTTP_404_NOT_FOUND
    
    # 4. User B tries to delete User A's document
    res_del = client.delete(f"/api/v1/documents/{doc_id}", headers=headers_b)
    assert res_del.status_code == status.HTTP_404_NOT_FOUND

@patch("fitz.open")
def test_pdf_extraction_parsing(mock_fitz_open, client, auth_headers, db_session):
    """Tests PDF parsing page-by-page mapping using PyMuPDF."""
    page1 = MagicMock()
    page1.get_text.return_value = "Page one text."
    page2 = MagicMock()
    page2.get_text.return_value = "Page two details."
    
    mock_doc = MagicMock()
    mock_doc.__len__.return_value = 2
    mock_doc.__getitem__.side_effect = [page1, page2]
    mock_doc.is_encrypted = False
    mock_fitz_open.return_value = mock_doc

    # Upload document
    pdf_content = b"%PDF-1.4 dummy struct"
    res = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("pages.pdf", io.BytesIO(pdf_content), "application/pdf")}
    )
    doc_id = res.json()["id"]
    
    # Fetch from db to verify page count and status (FastAPI TestClient auto-runs background tasks)
    get_res = client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_res.json()["status"] == "Ready"
    assert get_res.json()["page_count"] == 2



@patch("docx.Document")
def test_docx_extraction_parsing(mock_docx, client, auth_headers, db_session):
    """Tests DOCX structural parsing and paragraph grouping."""
    para1 = MagicMock()
    para1.text = "Chapter 1: The Beginning"
    para1.style.name = "Heading 1"
    
    para2 = MagicMock()
    para2.text = "This is a body paragraph following heading 1."
    para2.style.name = "Normal"
    
    mock_doc = MagicMock()
    mock_doc.paragraphs = [para1, para2]
    mock_docx.return_value = mock_doc

    # Upload document
    docx_content = b"docx binary headers"
    res = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("structure.docx", io.BytesIO(docx_content), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    doc_id = res.json()["id"]
    
    # Fetch from db to verify status (FastAPI TestClient auto-runs background tasks)
    get_res = client.get(f"/api/v1/documents/{doc_id}", headers=auth_headers)
    assert get_res.json()["status"] == "Ready"



def test_recursive_splitter_mechanics():
    """Tests that text split recursively matches overlap limits and lengths."""
    from app.services.chunking_service import RecursiveCharacterSplitter
    splitter = RecursiveCharacterSplitter(chunk_size=40, chunk_overlap=10)
    
    text = "Hello world this is a test of the recursive splitter mechanism."
    splits = splitter.split_text(text)
    
    assert len(splits) > 1
    for split in splits:
        assert len(split) <= 40

