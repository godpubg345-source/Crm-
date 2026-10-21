"""
Standardized API Response Utilities.
Provides consistent response format across all endpoints.
"""
from rest_framework.response import Response
from rest_framework import status


class APIResponse:
    """
    Standardized API Response Helper.
    
    All responses follow the format:
    {
        "success": true/false,
        "data": {...} or [...],
        "message": "Optional message",
        "errors": {...} or null
    }
    """
    
    @staticmethod
    def success(data=None, message=None, status_code=status.HTTP_200_OK):
        """Return a successful response."""
        response_data = {
            "success": True,
            "data": data,
            "message": message,
            "errors": None
        }
        return Response(response_data, status=status_code)
    
    @staticmethod
    def created(data=None, message="Created successfully"):
        """Return a 201 Created response."""
        return APIResponse.success(data, message, status.HTTP_201_CREATED)
    
    @staticmethod
    def error(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """Return an error response."""
        response_data = {
            "success": False,
            "data": None,
            "message": message,
            "errors": errors
        }
        return Response(response_data, status=status_code)
    
    @staticmethod
    def not_found(message="Resource not found"):
        """Return a 404 Not Found response."""
        return APIResponse.error(message, status_code=status.HTTP_404_NOT_FOUND)
    
    @staticmethod
    def unauthorized(message="Authentication required"):
        """Return a 401 Unauthorized response."""
        return APIResponse.error(message, status_code=status.HTTP_401_UNAUTHORIZED)
    
    @staticmethod
    def forbidden(message="You do not have permission to perform this action"):
        """Return a 403 Forbidden response."""
        return APIResponse.error(message, status_code=status.HTTP_403_FORBIDDEN)
    
    @staticmethod
    def validation_error(errors):
        """Return a 400 Validation Error response."""
        return APIResponse.error("Validation failed", errors, status.HTTP_400_BAD_REQUEST)
    
    @staticmethod
    def server_error(message="Internal server error"):
        """Return a 500 Server Error response."""
        return APIResponse.error(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


def api_response(data=None, message=None, success=True, errors=None, status_code=200):
    """
    Shorthand function for creating API responses.
    """
    if success:
        return APIResponse.success(data, message, status_code)
    return APIResponse.error(message or "Error", errors, status_code)
