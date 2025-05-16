import os # Import the os module
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate # Import Migrate

from dotenv import load_dotenv # Import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask extensions outside create_app, but tie them to the app later
db = SQLAlchemy()
cors = CORS() # Initialize CORS instance
jwt = JWTManager() # Initialize JWTManager instance
migrate = Migrate() # Initialize Migrate instance

# Define an application factory function
def create_app():
    # Create the Flask application instance
    app = Flask(__name__)

    # --- Configuration ---
    # Configure the database URI from environment variable
    # Use os.environ.get() to read the variable.
    # Provide a default value or raise an error if the variable is not set.
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///default_database.db') # Read from DATABASE_URL env var

    # Optional: Disable SQLAlchemy event system if you don't need it.
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Configure the secret key for signing JWTs from environment variable
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'fallback-jwt-secret-key') # Read from JWT_SECRET_KEY env var

    # Configure the general secret key from environment variable
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key') # Read from SECRET_KEY env var

    # --- End Configuration ---

    # --- Initialize Extensions with the app instance ---
    # This connects the pre-initialized extensions to the Flask app instance
    db.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db) # Initialize Migrate with the app and db
    # --- End Extension Initialization ---

    # --- Import and Register Blueprints ---
    # Blueprints organize your routes into modular components.
    # We import them *after* app is created to avoid circular imports.
    from app.routes.auth_routes import auth_bp
    from app.routes.creation_routes import creation_bp

    # Register blueprints WITH URL prefixes
    # /auth prefix for authentication routes
    app.register_blueprint(auth_bp, url_prefix='/auth') # Added url_prefix
    # /creation prefix for nodemap and agent creation/management routes
    app.register_blueprint(creation_bp, url_prefix='/creation') # Added url_prefix
    # --- End Blueprint Registration ---

    # --- Database Table Creation ---
    # This block ensures that database tables are created when the app context is pushed.
    # In production, you'd typically use Flask-Migrate for database migrations.
    with app.app_context():
        db.create_all() # Create database tables for our models if they don't exist
    # --- End Database Table Creation ---

    # --- Define basic routes (optional, could be in a blueprint) ---
    # These routes do NOT have the blueprint prefixes
    @app.route('/')
    def hello_world():
        """
        This function returns a simple greeting message.
        """
        return 'Hello, World!'

    @app.route('/api/status')
    def status():
        """
        This function returns a JSON response indicating the API status.
        """
        from flask import jsonify
        return jsonify(status='OK', message='API is running')
    # --- End basic routes ---


    # Return the created app instance
    return app

# Example of how you might run the app directly (for development)
# if __name__ == '__main__':
#     app = create_app()
#     app.run(debug=True, port=5001)
