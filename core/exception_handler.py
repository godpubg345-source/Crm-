"""
Custom Exception Handler for standardized error responses.
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns standardized error responses.
    
    Response format:
    {
        "success": false,
        "data": null,
        "message": "Error description",
        "errors": {...} or null
    }
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get request info for logging
    request = context.get('request')
    view = context.get('view')
    
    # Log the exception
    logger.error(
        f"API Exception: {exc.__class__.__name__} | "
        f"View: {view.__class__.__name__ if view else 'Unknown'} | "
        f"User: {request.user if request else 'Anonymous'} | "
        f"Path: {request.path if request else 'Unknown'}"
    )
    
    if response is not None:
        # Standardize the response format
        custom_response_data = {
            "success": False,
            "data": None,
            "message": _get_error_message(exc),
            "errors": _get_error_details(exc, response)
        }
        response.data = custom_response_data
        return response
    
    # Handle non-DRF exceptions
    if isinstance(exc, Http404) or isinstance(exc, ObjectDoesNotExist):
        return Response({
            "success": False,
            "data": None,
            "message": "Resource not found",
            "errors": None
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Unhandled exceptions - log and return 500
    logger.exception(f"Unhandled exception: {exc}")
    error_detail = {"detail": str(exc)} if settings.DEBUG and hasattr(exc, '__str__') else None
    return Response({
        "success": False,
        "data": None,
        "message": "An unexpected error occurred",
        "errors": error_detail
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _get_error_message(exc):
    """Extract a user-friendly error message from the exception."""
    if isinstance(exc, NotAuthenticated):
        return "Authentication credentials were not provided"
    elif isinstance(exc, AuthenticationFailed):
        return "Invalid authentication credentials"
    elif isinstance(exc, PermissionDenied):
        return "You do not have permission to perform this action"
    elif isinstance(exc, NotFound):
        return "Resource not found"
    elif isinstance(exc, ValidationError):
        return "Validation failed"
    elif hasattr(exc, 'detail'):
        if isinstance(exc.detail, str):
            return exc.detail
        elif isinstance(exc.detail, list):
            return exc.detail[0] if exc.detail else "An error occurred"
        elif isinstance(exc.detail, dict):
            # Get first error message from dict
            for key, value in exc.detail.items():
                if isinstance(value, list):
                    return f"{key}: {value[0]}"
                return f"{key}: {value}"
    return "An error occurred"


def _get_error_details(exc, response):
    """Extract error details from the exception."""
    if isinstance(exc, ValidationError):
        return exc.detail
    elif hasattr(exc, 'detail') and isinstance(exc.detail, dict):
        return exc.detail
    return None
