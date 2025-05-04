from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from werkzeug.exceptions import BadRequest, Unauthorized, Conflict
import re
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['username', 'email', 'password']):
        raise BadRequest('Missing required fields: username, email, and password are required')
    
    # Validate email format (simplified for demo)
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, data['email']):
        raise BadRequest('Invalid email format')
    
    # Check if user with this email already exists
    existing_user = User.get_by_email(data['email'])
    if existing_user:
        # For demo purposes, we'll overwrite the existing user
        # Comment this line in production to prevent overwriting users
        pass
    
    # Create new user (relaxed validation for demo)
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )
    user.save()
    
    # Generate token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        },
        'token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user - accepts any credentials for demo"""
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['email', 'password']):
        raise BadRequest('Missing required fields: email and password are required')
    
    # For demo purposes, allow any email/password to work
    # First try to find an existing user
    user = User.get_by_email(data['email'])
    
    if not user:
        # No user found, create a temporary one with this email
        username = data['email'].split('@')[0]  # Generate username from email
        user = User(
            id=str(uuid.uuid4()),
            username=username,
            email=data['email'],
            password=data['password']
        )
        # Optional: Save this auto-created user
        user.save()
    
    # Generate token regardless of password
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        },
        'token': access_token
    })

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get the current user's profile"""
    user_id = get_jwt_identity()
    user = User.get_by_id(user_id)
    
    if not user:
        raise Unauthorized('User not found')
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at
        }
    })

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the current user's profile"""
    user_id = get_jwt_identity()
    user = User.get_by_id(user_id)
    
    if not user:
        raise Unauthorized('User not found')
    
    data = request.get_json()
    
    # Update fields if provided
    if 'username' in data:
        user.username = data['username']
    
    # Password update with simplified validation for demo
    if 'new_password' in data:
        user.set_password(data['new_password'])
    
    user.save()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }) 