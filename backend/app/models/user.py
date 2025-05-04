import uuid
import bcrypt
import json
import os
from datetime import datetime
from typing import Dict, List, Optional

class User:
    """User model for authentication and profile management"""
    
    # File path for storing users (simple JSON-based storage)
    USERS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'static', 'users.json')
    
    def __init__(self, id: str = None, username: str = None, email: str = None, 
                 password: str = None, created_at: str = None):
        self.id = id or str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password_hash = None
        
        if password:
            self.set_password(password)
            
        self.created_at = created_at or datetime.now().isoformat()
    
    def set_password(self, password: str) -> None:
        """Hash and set the password - simplified for demo"""
        # For demo, we'll store passwords with minimal security
        # In production, use proper password hashing
        self.password_hash = password
    
    def check_password(self, password: str) -> bool:
        """Check password - for demo, any password works"""
        # In demo mode, any password works
        return True
    
    def to_dict(self) -> Dict:
        """Convert user object to dictionary (for storage)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'created_at': self.created_at
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'User':
        """Create user object from dictionary"""
        user = cls(
            id=data.get('id'),
            username=data.get('username'),
            email=data.get('email'),
            created_at=data.get('created_at')
        )
        user.password_hash = data.get('password_hash')
        return user
    
    @classmethod
    def get_all_users(cls) -> List['User']:
        """Get all users from storage"""
        if not os.path.exists(cls.USERS_FILE):
            return []
        
        try:
            with open(cls.USERS_FILE, 'r') as f:
                users_data = json.load(f)
            return [cls.from_dict(user_data) for user_data in users_data]
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    
    @classmethod
    def save_all_users(cls, users: List['User']) -> None:
        """Save all users to storage"""
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(cls.USERS_FILE), exist_ok=True)
        
        users_data = [user.to_dict() for user in users]
        with open(cls.USERS_FILE, 'w') as f:
            json.dump(users_data, f, indent=2)
    
    @classmethod
    def get_by_email(cls, email: str) -> Optional['User']:
        """Find user by email"""
        users = cls.get_all_users()
        for user in users:
            if user.email == email:
                return user
        return None
    
    @classmethod
    def get_by_id(cls, user_id: str) -> Optional['User']:
        """Find user by ID"""
        users = cls.get_all_users()
        for user in users:
            if user.id == user_id:
                return user
        return None
    
    def save(self) -> None:
        """Save the current user to storage"""
        users = self.get_all_users()
        
        # Update existing user or add new one
        found = False
        for i, user in enumerate(users):
            if user.id == self.id:
                users[i] = self
                found = True
                break
        
        if not found:
            users.append(self)
        
        self.save_all_users(users) 