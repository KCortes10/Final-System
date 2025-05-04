from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized
from app.models.image import Image
from app.models.user import User
import os
import uuid
from PIL import Image as PILImage
from datetime import datetime

uploads_bp = Blueprint('uploads', __name__)

# Allowed file extensions for image uploads
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    """Check if the file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@uploads_bp.route('', methods=['POST'])
@jwt_required()
def upload_image():
    """Upload a new image"""
    user_id = get_jwt_identity()
    
    # Check if user exists
    user = User.get_by_id(user_id)
    if not user:
        raise Unauthorized('User not found')
    
    # Check if the request contains a file
    if 'file' not in request.files:
        raise BadRequest('No file part in the request')
    
    file = request.files['file']
    
    # Check if the file is empty
    if file.filename == '':
        raise BadRequest('No file selected')
    
    # Check if the file has an allowed extension
    if not allowed_file(file.filename):
        raise BadRequest(f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}')
    
    # Get other form data
    title = request.form.get('title', 'Untitled')
    description = request.form.get('description', '')
    category = request.form.get('category', 'other')
    price = None
    
    # Parse price if provided
    if 'price' in request.form:
        try:
            price = float(request.form.get('price'))
        except (ValueError, TypeError):
            # If price is not a valid number, we'll use a default
            print(f"Invalid price value: {request.form.get('price')}")
    
    # Secure the filename and add a UUID to avoid collisions
    original_filename = secure_filename(file.filename)
    filename_parts = original_filename.rsplit('.', 1)
    unique_filename = f"{filename_parts[0]}_{uuid.uuid4().hex}.{filename_parts[1]}"
    
    # Create the upload path
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, unique_filename)
    
    try:
        # Save the file
        file.save(file_path)
        
        # Create thumbnail (optional)
        try:
            with PILImage.open(file_path) as img:
                # Resize image if it's too large (optional)
                max_size = (1920, 1080)
                if img.width > max_size[0] or img.height > max_size[1]:
                    img.thumbnail(max_size, PILImage.LANCZOS)
                    img.save(file_path)
        except Exception as e:
            print(f"Error processing image: {e}")
            # Continue even if thumbnail creation fails
        
        # Save the image metadata
        image = Image(
            title=title,
            description=description,
            filename=unique_filename,
            user_id=user_id,
            path=file_path,
            category=category,
            price=price
        )
        image.save()
        
        # Generate URLs for the frontend
        host_url = request.host_url.rstrip('/')
        image_url = f"{host_url}/api/uploads/{image.id}"
        thumbnail_url = f"{host_url}/api/uploads/{image.id}/thumbnail"
        
        return jsonify({
            'message': 'Image uploaded successfully',
            'image': {
                'id': image.id,
                'title': image.title,
                'description': image.description,
                'url': image_url,
                'thumbnail_url': thumbnail_url,
                'category': image.category,
                'filename': image.filename,
                'created_at': image.created_at
            }
        }), 201
        
    except Exception as e:
        # Handle errors
        print(f"Error uploading image: {e}")
        raise BadRequest('Error uploading image')

@uploads_bp.route('', methods=['GET'])
def get_images():
    """Get all uploaded images or filter by category or user_id"""
    category = request.args.get('category')
    user_id = request.args.get('user_id')
    
    if category and category != 'all':
        images = Image.get_by_category(category)
    elif user_id:
        # Get images uploaded by a specific user
        images = Image.get_by_user_id(user_id)
    else:
        images = Image.get_all_images()
    
    # Get host URL for full image URLs
    host_url = request.host_url.rstrip('/')
    
    # Transform to response format
    result = []
    
    for image in images:
        result.append({
            'id': image.id,
            'title': image.title,
            'description': image.description,
            'url': f"{host_url}/api/uploads/{image.id}",
            'thumbnail_url': f"{host_url}/api/uploads/{image.id}/thumbnail",
            'user_id': image.user_id,
            'category': image.category,
            'price': image.price,
            'rating': image.rating,
            'filename': image.filename,
            'created_at': image.created_at
        })
    
    return jsonify({
        'total': len(result),
        'images': result
    })

@uploads_bp.route('/<image_id>', methods=['GET'])
def get_image_file(image_id):
    """Get an image file by its ID"""
    image = Image.get_by_id(image_id)
    
    if not image or not image.path or not os.path.exists(image.path):
        raise NotFound('Image not found')
    
    # Extract the directory and filename
    directory = os.path.dirname(image.path)
    filename = os.path.basename(image.path)
    
    return send_from_directory(directory, filename)

@uploads_bp.route('/<image_id>/metadata', methods=['GET'])
def get_image_metadata(image_id):
    """Get metadata for an image by ID"""
    # Check if image exists
    image = Image.get_by_id(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404
    
    # Get host URL for full image URLs
    host_url = request.host_url.rstrip('/')
    
    # Return metadata for the image
    return jsonify({
        'id': image.id,
        'title': image.title,
        'description': image.description,
        'filename': image.filename,
        'url': f"{host_url}/api/uploads/{image.id}",
        'thumbnail_url': f"{host_url}/api/uploads/{image.id}/thumbnail",
        'category': image.category,
        'price': image.price,
        'rating': image.rating,
        'created_at': image.created_at
    })

@uploads_bp.route('/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    """Delete an image by its ID"""
    user_id = get_jwt_identity()
    
    # Get the image
    image = Image.get_by_id(image_id)
    
    if not image:
        raise NotFound('Image not found')
    
    # Check if the user is the owner of the image
    if image.user_id != user_id:
        raise Unauthorized('You are not authorized to delete this image')
    
    # Delete the image
    success = image.delete()
    
    if success:
        return jsonify({'message': 'Image deleted successfully'})
    else:
        raise BadRequest('Failed to delete image')

@uploads_bp.route('/<image_id>', methods=['PUT'])
@jwt_required()
def update_image(image_id):
    """Update image metadata"""
    user_id = get_jwt_identity()
    
    # Get the image
    image = Image.get_by_id(image_id)
    
    if not image:
        raise NotFound('Image not found')
    
    # Check if the user is the owner of the image
    if image.user_id != user_id:
        raise Unauthorized('You are not authorized to update this image')
    
    data = request.get_json()
    
    # Update fields if provided
    if 'title' in data:
        image.title = data['title']
    
    if 'description' in data:
        image.description = data['description']
    
    if 'category' in data:
        image.category = data['category']
    
    if 'price' in data:
        try:
            image.price = float(data['price'])
        except (ValueError, TypeError):
            raise BadRequest('Price must be a number')
    
    # Save the changes
    image.save()
    
    host_url = request.host_url.rstrip('/')
    
    return jsonify({
        'message': 'Image updated successfully',
        'image': {
            'id': image.id,
            'title': image.title,
            'description': image.description,
            'url': f"{host_url}/api/uploads/{image.id}",
            'thumbnail_url': f"{host_url}/api/uploads/{image.id}/thumbnail",
            'user_id': image.user_id,
            'category': image.category,
            'price': image.price,
            'rating': image.rating,
            'filename': image.filename,
            'created_at': image.created_at
        }
    }) 