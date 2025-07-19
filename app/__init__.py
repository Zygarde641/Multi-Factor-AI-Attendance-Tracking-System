from flask import Flask
from flask_cors import CORS
from app.routes import api_routes  # Ensure this import matches your Blueprint name
from app.database import init_db  # Make sure this function exists in database.py

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for frontend communication
    
    # Initialize database connection
    init_db()

    # Register API routes
    app.register_blueprint(api_routes)

    return app
