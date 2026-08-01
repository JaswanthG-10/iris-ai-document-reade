from fastapi import status

def test_register_user_success(client):
    """Tests that a user can register successfully with valid inputs."""
    payload = {
        "name": "Alice Developer",
        "email": "alice@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert "id" in data
    assert "password" not in data

def test_register_user_duplicate_email(client):
    """Tests registration fails if email is already registered."""
    payload = {
        "name": "Alice Developer",
        "email": "alice@example.com",
        "password": "securepassword123"
    }
    # Register once
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    
    # Register again with same email
    response_dup = client.post("/api/v1/auth/register", json=payload)
    assert response_dup.status_code == status.HTTP_409_CONFLICT
    assert "error" in response_dup.json()

def test_register_user_invalid_input(client):
    """Tests validation constraints fail for short password or invalid email."""
    # Invalid Email
    payload_bad_email = {
        "name": "Bob",
        "email": "not-an-email",
        "password": "validpassword"
    }
    response = client.post("/api/v1/auth/register", json=payload_bad_email)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # Short password
    payload_short_pass = {
        "name": "Bob",
        "email": "bob@example.com",
        "password": "123"
    }
    response = client.post("/api/v1/auth/register", json=payload_short_pass)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_login_user_success(client):
    """Tests successful authentication returns access token."""
    # 1. Register Alice
    payload = {
        "name": "Alice Developer",
        "email": "alice@example.com",
        "password": "securepassword123"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # 2. Login Alice
    login_data = {
        "username": payload["email"],  # OAuth2 password flow maps username to email field
        "password": payload["password"]
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_user_incorrect_credentials(client):
    """Tests login fails with invalid password."""
    # 1. Register Alice
    payload = {
        "name": "Alice Developer",
        "email": "alice@example.com",
        "password": "securepassword123"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    # 2. Login with incorrect password
    login_data = {
        "username": payload["email"],
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "error" in response.json()

def test_get_me_profile_success(client):
    """Tests profile details are returned for authenticated session."""
    payload = {
        "name": "Alice Developer",
        "email": "alice@example.com",
        "password": "securepassword123"
    }
    client.post("/api/v1/auth/register", json=payload)
    
    login_data = {
        "username": payload["email"],
        "password": payload["password"]
    }
    login_response = client.post("/api/v1/auth/login", data=login_data)
    token = login_response.json()["access_token"]
    
    # Retrieve /me with header
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["name"] == payload["name"]

def test_get_me_unauthorized(client):
    """Tests profile request is blocked without authorization header."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
