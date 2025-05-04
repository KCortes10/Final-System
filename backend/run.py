from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Create the Flask application
app = create_app()

if __name__ == '__main__':
    """Run the application when script is executed directly"""
    # Get port from environment variable or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app with debugging enabled for development
    app.run(host='0.0.0.0', port=port, debug=True) 