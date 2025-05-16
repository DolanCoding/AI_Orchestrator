# Import necessary modules from Flask
from flask import Blueprint, jsonify, request
# Import the regular expression module for email validation
import re
# Import functions for password hashing
from werkzeug.security import generate_password_hash, check_password_hash
# Import the db instance and User model
# Assuming db is initialized in app/__init__.py and models.py is in app/
from app import db
from app.models import User, Nodemap, Agent # Import the Nodemap and Agent models
# Import JWT functions
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Create a Blueprint named 'auth'.
# Blueprints help organize routes and other components into reusable modules.
# The first argument is the blueprint's name, which is used for endpoint naming.
# The second argument is the blueprint's import name, typically __name__.
auth_bp = Blueprint('auth', __name__)

# Define the route for user registration within the blueprint
# This route will accept POST requests
@auth_bp.route('/register', methods=['POST'])
def register_user():
    """
    Handles user registration requests.
    Expects JSON data with username, password, and email.
    Includes validation, checks for existing users/emails,
    hashes the password, and saves the user to the database.
    """
    # Get the JSON data from the request body
    data = request.get_json()

    # Basic check if data was received and contains required fields
    if not data:
        return jsonify({"error": "Invalid input: No data provided"}), 400 # Bad Request

    # Extract data
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # --- Validation Logic ---
    if not username:
        return jsonify({"error": "Username is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400
    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Email validation to check if the string contains an '@' symbol
    email_regex = r'.*@.*'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format (must contain @)"}), 400

    # Password validation: atleast 8 characters, atleast 1 digit, atleast 1 character
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long"}), 400
    if not any(char.isdigit() for char in password):
        return jsonify({"error": "Password must contain at least one digit"}), 400
    if not any(char.isalpha() for char in password):
        return jsonify({"error": "Password must contain at least one letter"}), 400
    # --- End Validation Logic ---

    # --- Check for existing user or email ---
    # Query the database to see if a user with the same username or email already exists
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()

    if existing_user:
        # If a user with the same username or email exists, return a conflict error
        if existing_user.username == username:
            return jsonify({"error": "Username already exists"}), 409 # Conflict
        else:
            return jsonify({"error": "Email address already registered"}), 409 # Conflict
    # --- End Check for existing user or email ---

    # --- Password Hashing ---
    # Hash the password before storing it in the database
    hashed_password = generate_password_hash(password)
    # --- End Password Hashing ---

    # --- Save the userData to the database ---
    # Create a new User instance with the validated and hashed data
    new_user = User(username=username, email=email, password=hashed_password)

    try:
        # Add the new user to the database session
        db.session.add(new_user)
        # Commit the session to save the user to the database
        db.session.commit()
    except Exception as e:
        # If an error occurs during the database operation, rollback the session
        db.session.rollback()
        print(f"Database error during user registration: {e}")
        return jsonify({"error": "An error occurred while saving the user"}), 500 # Internal Server Error
    # --- End Save the userData to the database ---

    print(f"Successfully registered user: {username}")

    # Return a success message
    # In a real app, you might return user info (excluding password) or a token
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": new_user.id, # Return the newly created user's ID
            "username": new_user.username,
            "email": new_user.email
        }
    }), 201 # Created

# Define the route for user login within the blueprint
# This route will accept POST requests
@auth_bp.route('/login', methods=['POST'])
def login_user():
    """
    Handles user login requests.
    Expects JSON data with emailOrUsername and password.
    Queries the database and verifies the password.
    Generates and returns a JWT upon successful authentication,
    including a list of the user's nodemaps and agents.
    """
    # Get the JSON data from the request body
    data = request.get_json()

    # Basic check if data was received and contains required fields
    if not data:
        return jsonify({"error": "Invalid input: No data provided"}), 400 # Bad Request

    # Extract data
    email_or_username = data.get('emailOrUsername')
    password = data.get('password')

    # --- Validation Logic for Login ---
    if not email_or_username:
        return jsonify({"error": "Email or Username is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400
    # --- End Validation Logic ---

    # --- Query the database for the user ---
    # Try to find the user by email or username
    user = User.query.filter(
        (User.username == email_or_username) | (User.email == email_or_username)
    ).first()
    # --- End Query ---

    # --- Verify the password and generate token ---
    # Check if a user was found and if the provided password matches the stored hash
    if user and check_password_hash(user.password, password):
        # Password matches, user is authenticated
        print(f"User logged in successfully: {user.username}")

        # Create the access token with the user's ID as the identity
        # Ensure the identity is a string!
        access_token = create_access_token(identity=str(user.id))

        # --- Fetch the user's nodemaps ---
        # Access the 'nodemaps' relationship on the user object
        user_nodemaps = user.nodemaps

        # Prepare a list of nodemap data to include in the response
        nodemaps_list = []
        for nodemap in user_nodemaps:
            nodemaps_list.append({
                "id": nodemap.id,
                "name": nodemap.name,
                "goal": nodemap.goal,
                "description": nodemap.description,
                "created_at": nodemap.created_at.isoformat(), # Convert datetime to string
                "is_favorite": nodemap.is_favorite # Include the is_favorite status here
                # Add other nodemap fields you want to return
            })
        # --- End Fetch and Prepare Nodemap List ---

        # --- Fetch the user's agents ---
        # Access the 'agents' relationship on the user object
        user_agents = user.agents

        # Prepare a list of agent data to include in the response
        agents_list = []
        for agent in user_agents:
             agents_list.append({
                "id": agent.id,
                "name": agent.name,
                "type": agent.type,
                "model": agent.model,
                "system_prompt": agent.system_prompt, # Include system prompt if needed on frontend
                "created_at": agent.created_at.isoformat() # Convert datetime to string
                # Add other agent fields you want to return
            })
        # --- End Fetch and Prepare Agent List ---


        # Return the access token, user info, and the lists of nodemaps and agents
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "nodemaps": nodemaps_list, # Include the list of nodemaps here
            "agents": agents_list # Include the list of agents here
        }), 200 # OK
    else:
        # No user found or password does not match
        print(f"Login failed for: {email_or_username}")
        return jsonify({"error": "Invalid email/username or password"}), 401 # Unauthorized

# --- Protected Route to Get User Data and Nodemaps/Agents ---
# This route is used by the fetchUserData thunk after the initial app load
@auth_bp.route('/user_data', methods=['GET'])
@jwt_required() # Protect this route - requires a valid JWT
def get_user_data():
    """
    Protected route to get the logged-in user's details and their nodemaps and agents.
    Requires a valid JWT access token in the Authorization header.
    Includes the is_favorite status for nodemaps.
    """
    # Get the identity of the current user from the JWT
    current_user_id = get_jwt_identity()

    # Fetch the user from the database using the identity from the token
    user = User.query.get(current_user_id)

    if user:
        # --- Fetch the user's nodemaps (same logic as in login) ---
        user_nodemaps = user.nodemaps
        nodemaps_list = []
        for nodemap in user_nodemaps:
            nodemaps_list.append({
                "id": nodemap.id,
                "name": nodemap.name,
                "goal": nodemap.goal,
                "description": nodemap.description,
                "created_at": nodemap.created_at.isoformat(), # Convert datetime to string
                 "is_favorite": nodemap.is_favorite # Include the is_favorite status here
                # Add other nodemap fields you want to return
            })
        # --- End Fetch and Prepare Nodemap List ---

        # --- Fetch the user's agents (same logic as in login) ---
        user_agents = user.agents
        agents_list = []
        for agent in user_agents:
             agents_list.append({
                "id": agent.id,
                "name": agent.name,
                "type": agent.type,
                "model": agent.model,
                "system_prompt": agent.system_prompt, # Include system prompt if needed on frontend
                "created_at": agent.created_at.isoformat() # Convert datetime to string
                # Add other agent fields you want to return
            })
        # --- End Fetch and Prepare Agent List ---


        # Return the user info and the lists of nodemaps and agents
        return jsonify({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            },
            "nodemaps": nodemaps_list, # Include the list of nodemaps here
            "agents": agents_list # Include the list of agents here
        }), 200 # OK
    else:
        # This case should ideally not happen if the token identity is valid
        # and the user exists, but handle it just in case.
        return jsonify({"error": "User not found"}), 404 # Not Found
# --- End Protected Route ---

# --- Logout Route ---
@auth_bp.route('/logout', methods=['POST'])
@jwt_required() # Protect this route - requires a valid JWT
def logout():
    """
    Handles user logout requests.
    Requires a valid JWT access token.
    On the backend, this might involve invalidating the token
    or clearing session data if using server-side sessions.
    For JWT, often client-side token removal is sufficient,
    but a backend endpoint can be used for token revocation lists.
    """
    # In a typical JWT setup, logout is primarily client-side
    # (removing the token from storage).
    # This backend endpoint can be used for token revocation lists
    # if you are implementing token blacklisting.

    # Get the identity of the current user (optional, for logging)
    current_user_id = get_jwt_identity()
    print(f"User {current_user_id} attempting logout.")

    # You might add logic here to add the token to a revocation list
    # if you are implementing token blacklisting.

    return jsonify({"message": "Logout successful"}), 200 # OK
# --- End Logout Route ---
