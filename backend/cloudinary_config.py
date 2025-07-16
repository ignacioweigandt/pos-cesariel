import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from typing import Optional
from fastapi import HTTPException

# Configuración de Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Validar que las variables de entorno estén configuradas
if not all([os.getenv("CLOUDINARY_CLOUD_NAME"), os.getenv("CLOUDINARY_API_KEY"), os.getenv("CLOUDINARY_API_SECRET")]):
    raise ValueError("Las variables de entorno de Cloudinary no están configuradas correctamente")

def upload_image_to_cloudinary(
    file_content: bytes, 
    filename: str,
    folder: str = "pos-cesariel",
    resource_type: str = "image"
) -> dict:
    """
    Upload an image to Cloudinary
    
    Args:
        file_content: The image file content as bytes
        filename: Original filename
        folder: Cloudinary folder to upload to
        resource_type: Type of resource (image, video, etc.)
    
    Returns:
        dict: Cloudinary response with URL and metadata
    """
    try:
        # Generate a unique public_id
        import uuid
        import os
        file_extension = os.path.splitext(filename)[1].lower()
        public_id = f"{folder}/{uuid.uuid4().hex}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file_content,
            public_id=public_id,
            resource_type=resource_type
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result.get("width"),
            "height": result.get("height"),
            "format": result.get("format"),
            "bytes": result.get("bytes")
        }
        
    except Exception as e:
        print(f"Error uploading to Cloudinary: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error uploading image to Cloudinary: {str(e)}"
        )

def delete_image_from_cloudinary(public_id: str) -> bool:
    """
    Delete an image from Cloudinary
    
    Args:
        public_id: The Cloudinary public_id of the image to delete
    
    Returns:
        bool: True if deletion was successful
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Error deleting from Cloudinary: {str(e)}")
        return False

def get_optimized_url(
    public_id: str, 
    width: Optional[int] = None, 
    height: Optional[int] = None,
    quality: str = "auto"
) -> str:
    """
    Get an optimized URL for a Cloudinary image
    
    Args:
        public_id: The Cloudinary public_id
        width: Desired width
        height: Desired height
        quality: Quality setting (auto, auto:low, auto:good, auto:best)
    
    Returns:
        str: Optimized image URL
    """
    transformations = [{"quality": quality}]
    
    if width or height:
        crop_params = {"crop": "limit"}
        if width:
            crop_params["width"] = width
        if height:
            crop_params["height"] = height
        transformations.append(crop_params)
    
    return cloudinary.CloudinaryImage(public_id).build_url(transformation=transformations)

def extract_public_id_from_url(url: str) -> Optional[str]:
    """
    Extract the public_id from a Cloudinary URL
    
    Args:
        url: Cloudinary URL
    
    Returns:
        str: The public_id or None if not a Cloudinary URL
    """
    try:
        if "cloudinary.com" not in url:
            return None
            
        # Extract public_id from URL
        # Format: https://res.cloudinary.com/cloud_name/image/upload/public_id.extension
        parts = url.split("/")
        if len(parts) >= 7 and "upload" in parts:
            upload_index = parts.index("upload")
            if upload_index + 1 < len(parts):
                public_id_with_ext = "/".join(parts[upload_index + 1:])
                # Remove file extension
                public_id = os.path.splitext(public_id_with_ext)[0]
                return public_id
                
        return None
    except Exception:
        return None