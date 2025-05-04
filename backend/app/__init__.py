from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from datetime import timedelta

# Create the application instance
def create_app():
    app = Flask(__name__, static_folder='../static', static_url_path='/static')
    
    # Configure the app
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    
    # Initialize extensions with CORS support for multiple origins
    cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001')
    CORS(app, resources={r"/api/*": {"origins": cors_origins.split(','), "supports_credentials": True}})
    jwt = JWTManager(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.uploads import uploads_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    
    return app 