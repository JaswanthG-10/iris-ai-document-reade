from fastapi import HTTPException, status

class DocuMindException(Exception):
    """Base exception for all DocuMind application errors."""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class AuthenticationException(DocuMindException):
    """Raised when authentication fails or token is invalid."""
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)

class NotFoundException(DocuMindException):
    """Raised when a resource is not found."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class DuplicateException(DocuMindException):
    """Raised when a unique constraint or duplicate file check fails."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_409_CONFLICT)

class ValidationException(DocuMindException):
    """Raised when file size, type, or contents fail checks."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class ProcessingException(DocuMindException):
    """Raised when document extraction, chunking, or embedding fails."""
    def __init__(self, message: str):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
