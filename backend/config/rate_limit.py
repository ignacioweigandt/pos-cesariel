"""
Rate Limiting Configuration for POS Cesariel API.

This module configures rate limiting using SlowAPI to protect endpoints
from abuse, brute force attacks, and excessive usage.

Rate limits are applied based on IP address and configured per endpoint
to balance security and usability.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import os


# ===== RATE LIMIT CONFIGURATION =====

# Key function to identify clients (by IP address)
# In production, you might want to use authentication token instead
def get_identifier(request: Request) -> str:
    """
    Get client identifier for rate limiting.
    
    Uses IP address by default. In production, you might want to use
    user ID from JWT token for authenticated endpoints.
    
    Args:
        request: FastAPI request object
        
    Returns:
        str: Client identifier (IP address)
    """
    try:
        # Get real IP even if behind proxy
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection IP
        return get_remote_address(request)
    except Exception as e:
        # If all fails, return a default identifier
        print(f"Error getting identifier for rate limiting: {e}")
        return "unknown"


# ===== RATE LIMITER INSTANCE =====

# Create limiter instance with configuration
# Temporarily disabled in production until proper error handling is configured
limiter = Limiter(
    key_func=get_identifier,
    default_limits=["60/minute"],  # Default: 60 requests per minute
    enabled=os.getenv("RATE_LIMIT_ENABLED", "false").lower() == "true",  # Disabled by default, enable with env var
    headers_enabled=True,  # Send rate limit info in response headers
    storage_uri="memory://",  # Use in-memory storage (Redis recommended for production)
)


# ===== CUSTOM ERROR HANDLER =====

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom error handler for rate limit exceeded errors.
    
    Returns a user-friendly JSON response with retry information.
    
    Args:
        request: FastAPI request object
        exc: RateLimitExceeded exception
        
    Returns:
        JSONResponse: Custom error response with status 429
    """
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please slow down and try again later.",
            "detail": str(exc),
            "retry_after": exc.detail if hasattr(exc, 'detail') else "60 seconds",
        },
        headers={
            "Retry-After": "60",  # Tell client when to retry
        }
    )


# ===== RATE LIMIT PRESETS =====

class RateLimits:
    """
    Predefined rate limit configurations for different endpoint types.
    
    These are conservative limits that balance security and usability.
    Adjust based on your specific needs and infrastructure.
    """
    
    # Authentication endpoints - strict limits to prevent brute force
    AUTH_LOGIN = "5/minute"  # 5 login attempts per minute
    AUTH_REGISTER = "3/hour"  # 3 registrations per hour
    
    # Public e-commerce endpoints - generous limits for browsing
    ECOMMERCE_READ = "100/minute"  # Browse products, categories
    ECOMMERCE_WRITE = "10/minute"  # Create orders, add to cart
    
    # Admin operations - moderate limits
    ADMIN_READ = "60/minute"  # List resources
    ADMIN_WRITE = "30/minute"  # Create/update/delete
    
    # Heavy operations - very strict limits
    BULK_IMPORT = "10/hour"  # Product imports
    BULK_EXPORT = "20/hour"  # Data exports
    REPORT_GENERATION = "10/minute"  # Generate reports
    
    # File uploads
    FILE_UPLOAD = "20/hour"  # Image uploads
    
    # Default for other endpoints
    DEFAULT = "60/minute"


# ===== UTILITIES =====

def get_rate_limit_info(request: Request) -> dict:
    """
    Get current rate limit information for a request.
    
    Useful for displaying quota information to users.
    
    Args:
        request: FastAPI request object
        
    Returns:
        dict: Rate limit information
    """
    # This would need to be implemented based on storage backend
    # For now, return basic info
    return {
        "limit": "60/minute",
        "remaining": "unknown",
        "reset": "unknown"
    }


def is_rate_limited(request: Request) -> bool:
    """
    Check if a request would be rate limited.
    
    Useful for checking before expensive operations.
    
    Args:
        request: FastAPI request object
        
    Returns:
        bool: True if request would be rate limited
    """
    # This would need to check against the limiter's storage
    # Implementation depends on storage backend (memory/Redis)
    return False


# ===== EXEMPTIONS =====

# IP addresses exempt from rate limiting (e.g., internal services)
RATE_LIMIT_EXEMPT_IPS = os.getenv("RATE_LIMIT_EXEMPT_IPS", "").split(",")

def is_exempt_from_rate_limit(request: Request) -> bool:
    """
    Check if request is exempt from rate limiting.
    
    Use sparingly - only for internal services or health checks.
    
    Args:
        request: FastAPI request object
        
    Returns:
        bool: True if request should bypass rate limiting
    """
    client_ip = get_identifier(request)
    
    # Health check endpoints
    if request.url.path in ["/health", "/", "/docs", "/redoc"]:
        return True
    
    # Exempt IPs
    if client_ip in RATE_LIMIT_EXEMPT_IPS:
        return True
    
    return False
