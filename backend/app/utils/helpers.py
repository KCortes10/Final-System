import os
import uuid
from PIL import Image
from flask import current_app
from typing import Tuple, Optional

def create_thumbnail(image_path: str, size: Tuple[int, int] = (300, 300)) -> Optional[str]:
    """
    Create a thumbnail for an image
    
    Args:
        image_path: Path to the original image
        size: Thumbnail size as (width, height)
        
    Returns:
        Path to the created thumbnail or None if failed
    """
    if not os.path.exists(image_path):
        return None
    
    try:
        # Generate thumbnail filename
        filename = os.path.basename(image_path)
        name, ext = os.path.splitext(filename)
        thumbnail_name = f"{name}_thumb{ext}"
        
        # Generate thumbnail path
        upload_folder = current_app.config['UPLOAD_FOLDER']
        thumbnail_path = os.path.join(upload_folder, thumbnail_name)
        
        # Create thumbnail
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.LANCZOS)
            img.save(thumbnail_path)
            
        return thumbnail_path
    except Exception as e:
        print(f"Error creating thumbnail: {e}")
        return None

def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename to avoid collisions
    
    Args:
        original_filename: Original filename
        
    Returns:
        Unique filename with UUID
    """
    if not original_filename:
        return f"{uuid.uuid4().hex}.jpg"
    
    name, ext = os.path.splitext(original_filename)
    if not ext:
        ext = '.jpg'
    
    return f"{name}_{uuid.uuid4().hex}{ext}"

def get_file_extension(filename: str) -> str:
    """
    Get the file extension
    
    Args:
        filename: Filename
        
    Returns:
        File extension with the dot (e.g., '.jpg')
    """
    if not filename or '.' not in filename:
        return ''
    
    return os.path.splitext(filename)[1].lower()

def is_valid_image(file_path: str) -> bool:
    """
    Check if the file is a valid image
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if it's a valid image, False otherwise
    """
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False 