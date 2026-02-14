"""
Base schema configuration for Pydantic models.

Provides custom serializers to ensure consistent datetime formatting across all API responses.
"""

from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, model_serializer


class BaseSchema(BaseModel):
    """
    Base Pydantic model with custom datetime serialization.
    
    All datetime fields are serialized as ISO 8601 strings with 'Z' suffix
    to indicate UTC timezone, ensuring proper client-side timezone conversion.
    
    Example:
        Without Z: "2026-02-14T23:17:35.840854" (ambiguous, interpreted as local time)
        With Z:    "2026-02-14T23:17:35.840854Z" (explicit UTC, converted to local time)
    """
    
    model_config = ConfigDict(
        from_attributes=True,  # Enable ORM mode for SQLAlchemy models
    )
    
    @model_serializer
    def serialize_model(self) -> dict[str, Any]:
        """
        Custom serializer that adds 'Z' to datetime fields.
        """
        data = {}
        for field_name, field_info in self.model_fields.items():
            value = getattr(self, field_name, None)
            if isinstance(value, datetime):
                # Add 'Z' suffix to naive datetimes (UTC)
                data[field_name] = value.isoformat() + 'Z' if value.tzinfo is None else value.isoformat()
            else:
                data[field_name] = value
        return data
