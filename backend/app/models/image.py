import uuid
import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class Image:
    """Model for representing uploaded images"""
    
    # File path for storing image metadata (simple JSON-based storage)
    IMAGES_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'images.json')
    
    def __init__(self, id: str = None, title: str = None, description: str = None, 
                 filename: str = None, user_id: str = None, path: str = None, 
                 created_at: str = None, price: float = None, category: str = None):
        self.id = id or str(uuid.uuid4())
        self.title = title
        self.description = description
        self.filename = filename
        self.user_id = user_id
        self.path = path
        self.price = price or round(float(uuid.uuid4().int % 50) + 5, 2)  # Random price between $5 and $55
        self.category = category or "other"
        self.created_at = created_at or datetime.now().isoformat()
        self.rating = round(float(uuid.uuid4().int % 2) + 3, 1)  # Random rating between 3.0 and 5.0
    
    def to_dict(self) -> Dict:
        """Convert image object to dictionary (for storage)"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'filename': self.filename,
            'user_id': self.user_id,
            'path': self.path,
            'price': self.price,
            'category': self.category,
            'rating': self.rating,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Image':
        """Create image object from dictionary"""
        image = cls(
            id=data.get('id'),
            title=data.get('title'),
            description=data.get('description'),
            filename=data.get('filename'),
            user_id=data.get('user_id'),
            path=data.get('path'),
            price=data.get('price'),
            category=data.get('category'),
            created_at=data.get('created_at')
        )
        image.rating = data.get('rating', 4.0)
        return image
    
    @classmethod
    def get_all_images(cls) -> List['Image']:
        """Get all images from storage"""
        if not os.path.exists(cls.IMAGES_FILE):
            return []
        
        try:
            with open(cls.IMAGES_FILE, 'r') as f:
                images_data = json.load(f)
            return [cls.from_dict(image_data) for image_data in images_data]
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    @classmethod
    def save_all_images(cls, images: List['Image']) -> None:
        """Save all images to storage"""
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(cls.IMAGES_FILE), exist_ok=True)
        
        images_data = [image.to_dict() for image in images]
        with open(cls.IMAGES_FILE, 'w') as f:
            json.dump(images_data, f, indent=2)
    
    @classmethod
    def get_by_id(cls, image_id: str) -> Optional['Image']:
        """Find image by ID"""
        images = cls.get_all_images()
        for image in images:
            if image.id == image_id:
                return image
        return None
    
    @classmethod
    def get_by_user_id(cls, user_id: str) -> List['Image']:
        """Find images by user ID"""
        images = cls.get_all_images()
        return [image for image in images if image.user_id == user_id]
    
    @classmethod
    def get_by_category(cls, category: str) -> List['Image']:
        """Find images by category"""
        images = cls.get_all_images()
        return [image for image in images if image.category.lower() == category.lower()]
    
    @classmethod
    def search(cls, query: str) -> List['Image']:
        """Search images by title, description, or filename"""
        images = cls.get_all_images()
        query = query.lower()
        return [
            image for image in images 
            if (image.title and query in image.title.lower()) or 
               (image.description and query in image.description.lower()) or
               (image.filename and query in image.filename.lower())
        ]
    
    def save(self) -> None:
        """Save the current image to storage"""
        images = self.get_all_images()
        
        # Update existing image or add new one
        found = False
        for i, image in enumerate(images):
            if image.id == self.id:
                images[i] = self
                found = True
                break
        
        if not found:
            images.append(self)
        
        self.save_all_images(images)
    
    def delete(self) -> bool:
        """Delete the current image from storage"""
        images = self.get_all_images()
        initial_count = len(images)
        
        # Remove the image if it exists
        images = [image for image in images if image.id != self.id]
        
        # Check if an image was removed
        if len(images) < initial_count:
            self.save_all_images(images)
            
            # Try to remove the actual file
            if self.path and os.path.exists(self.path):
                try:
                    os.remove(self.path)
                except OSError:
                    pass  # Failed to remove file, but metadata was deleted
                    
            return True
        
        return False 