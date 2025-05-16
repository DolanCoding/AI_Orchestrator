from flask import Blueprint, request, jsonify
# Import jwt_required and get_jwt_identity for route protection
from flask_jwt_extended import jwt_required, get_jwt_identity
import json # Import the json module for serialization

from app import db # Import the SQLAlchemy db instance
from app.models import Nodemap, User, Agent # Import the Nodemap and Agent models

# Create a Blueprint for creation-related routes
creation_bp = Blueprint('creation', __name__)


# Define a route to create a new Nodemap
# This route requires a valid JWT access token
@creation_bp.route('/createmap', methods=['POST'])
@jwt_required() # Protect this route with JWT authentication
def create_nodemap():
    """
    Handles the creation of a new Nodemap.
    Requires a valid JWT access token.
    Expects JSON data with 'name', 'goal', and 'description'.
    Includes a check to prevent duplicate nodemap names for the same user.
    Initializes nodes_data and edges_data as empty, and is_favorite as False.
    """
    # Get the identity of the current user from the JWT
    current_user_id = get_jwt_identity()

    # Get the JSON data from the request
    data = request.get_json(silent=True)

    # --- Data Validation ---
    if not data:
        return jsonify({"error": "Invalid input: No data provided or invalid JSON"}), 400

    name = data.get('name')
    goal = data.get('goal')
    description = data.get('description')

    if not name:
        return jsonify({"error": "Nodemap name is required"}), 400
    if not goal:
        return jsonify({"error": "Nodemap goal is required"}), 400
    if not description:
        return jsonify({"error": "Nodemap description is required"}), 400
    # --- End Data Validation ---

    # --- Check for existing Nodemap with the same name for this user ---
    existing_nodemap = Nodemap.query.filter_by(user_id=current_user_id, name=name).first()

    if existing_nodemap:
        print(f"Attempted to create duplicate nodemap name '{name}' for user ID: {current_user_id}")
        return jsonify({"error": f"You already have a nodemap named '{name}'"}), 409 # Conflict
    # --- End Check ---


    # --- Create and Save Nodemap ---
    # Create a new Nodemap instance
    # nodes_data and edges_data will use their default values ('[]')
    # is_favorite will use its default value (False)
    new_nodemap = Nodemap(
        name=name,
        goal=goal,
        description=description,
        user_id=current_user_id # Link the nodemap to the current user
    )

    try:
        db.session.add(new_nodemap)
        db.session.commit()
        print(f"Successfully created nodemap: {name} (ID: {new_nodemap.id}) for user ID: {current_user_id}")
        return jsonify({
            "message": "Nodemap created successfully",
            "nodemap_id": new_nodemap.id,
            "name": new_nodemap.name,
            "goal": new_nodemap.goal,
            "description": new_nodemap.description,
            "created_at": new_nodemap.created_at.isoformat() if new_nodemap.created_at else None,
            "nodes_data": new_nodemap.nodes_data, # Should be '[]'
            "edges_data": new_nodemap.edges_data,  # Should be '[]'
            "is_favorite": new_nodemap.is_favorite # Include the new field
        }), 201 # Created
    except Exception as e:
        db.session.rollback()
        print(f"Database error during nodemap creation: {e}")
        return jsonify({"error": "An error occurred while creating the nodemap"}), 500 # Internal Server Error

    # --- End Create and Save ---


# --- Define a route to create a new AI Agent ---
# This route requires a valid JWT access token
@creation_bp.route('/createagent', methods=['POST'])
@jwt_required() # Protect this route with JWT authentication
def create_agent():
    """
    Handles the creation of a new AI Agent.
    Requires a valid JWT access token.
    Expects JSON data with 'name', 'type', 'model', and 'system_prompt'.
    Includes a check to prevent duplicate agent names for the same user.
    """
    # Get the identity of the current user from the JWT
    current_user_id = get_jwt_identity()

    # Get the JSON data from the request
    data = request.get_json(silent=True)

    # --- Data Validation ---
    if not data:
        return jsonify({"error": "Invalid input: No data provided or invalid JSON"}), 400

    name = data.get('name')
    agent_type = data.get('type') # Use a different variable name to avoid conflict with Python's built-in type()
    model = data.get('model')
    system_prompt = data.get('system_prompt')


    if not name:
        return jsonify({"error": "Agent name is required"}), 400
    if not agent_type:
        return jsonify({"error": "Agent type is required"}), 400
    if not model:
        return jsonify({"error": "Agent model is required"}), 400
    if not system_prompt:
        return jsonify({"error": "System prompt is required"}), 400
    # --- End Data Validation ---

    # --- Check for existing Agent with the same name for this user ---
    # Query the database to find if an agent with the same name already exists for the current user
    existing_agent = Agent.query.filter_by(user_id=current_user_id, name=name).first()

    if existing_agent:
        print(f"Attempted to create duplicate agent name '{name}' for user ID: {current_user_id}")
        return jsonify({"error": f"You already have an agent named '{name}'"}), 409 # Conflict
    # --- End Check ---


    # --- Create and Save Agent ---
    # Create a new Agent instance
    new_agent = Agent(
        name=name,
        type=agent_type,
        model=model,
        system_prompt=system_prompt,
        user_id=current_user_id # Link the agent to the current user
    )

    try:
        db.session.add(new_agent)
        db.session.commit()
        print(f"Successfully created agent: {name} (ID: {new_agent.id}) for user ID: {current_user_id}")
        return jsonify({
            "message": "Agent created successfully",
            "agent_id": new_agent.id,
            "name": new_agent.name,
            "type": new_agent.type,
            "model": new_agent.model,
            "system_prompt": new_agent.system_prompt,
            "created_at": new_agent.created_at.isoformat() if new_agent.created_at else None
        }), 201 # Created
    except Exception as e:
        db.session.rollback()
        print(f"Database error during agent creation: {e}")
        return jsonify({"error": "An error occurred while creating the agent"}), 500 # Internal Server Error

    # --- End Create and Save ---


# --- Define a route to save Node Map data ---
@creation_bp.route('/savenodemap', methods=['POST'])
@jwt_required() # Protect this route with JWT authentication
def save_nodemap_data():
    """
    Handles saving the nodes and edges data for a specific Nodemap.
    Requires a valid JWT access token.
    Expects JSON data with 'nodemap_id', 'nodes', and 'edges'.
    Ensures the nodemap belongs to the current user.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json(silent=True)

    # --- Data Validation ---
    if not data:
        return jsonify({"error": "Invalid input: No data provided or invalid JSON"}), 400

    nodemap_id = data.get('nodemap_id')
    nodes = data.get('nodes')
    edges = data.get('edges')

    if nodemap_id is None:
        return jsonify({"error": "Nodemap ID is required"}), 400
    if nodes is None or not isinstance(nodes, list):
        return jsonify({"error": "'nodes' must be a list"}), 400
    if edges is None or not isinstance(edges, list):
        return jsonify({"error": "'edges' must be a list"}), 400
    # --- End Data Validation ---

    # --- Find the Nodemap and verify ownership ---
    nodemap = Nodemap.query.filter_by(id=nodemap_id, user_id=current_user_id).first()

    if not nodemap:
        print(f"Attempted to save data for non-existent or unauthorized nodemap ID: {nodemap_id} by user ID: {current_user_id}")
        return jsonify({"error": "Nodemap not found or you do not have permission to edit it"}), 404 # Not Found or Forbidden
    # --- End Find and Verify ---

    # --- Save the nodes and edges data ---
    try:
        # Serialize the nodes and edges lists to JSON strings
        nodemap.nodes_data = json.dumps(nodes)
        nodemap.edges_data = json.dumps(edges)

        db.session.commit()
        print(f"Successfully saved data for nodemap ID: {nodemap.id} for user ID: {current_user_id}")
        return jsonify({"message": "Nodemap data saved successfully", "nodemap_id": nodemap.id}), 200 # OK
    except Exception as e:
        db.session.rollback()
        print(f"Database error during nodemap data save for ID {nodemap_id}: {e}")
        return jsonify({"error": "An error occurred while saving nodemap data"}), 500 # Internal Server Error
    # --- End Save ---

# --- Define a route to get all Node Maps for the current user ---
@creation_bp.route('/getnodemaps', methods=['GET'])
@jwt_required() # Protect this route
def get_nodemaps():
    """
    Fetches all nodemaps for the current user.
    Requires a valid JWT access token.
    Includes the is_favorite status in the response.
    """
    current_user_id = get_jwt_identity()

    try:
        # Query all nodemaps belonging to the current user
        user_nodemaps = Nodemap.query.filter_by(user_id=current_user_id).all()

        # Prepare a list of nodemap data to return
        nodemaps_list = []
        for nodemap in user_nodemaps:
            nodemaps_list.append({
                "id": nodemap.id,
                "name": nodemap.name,
                "goal": nodemap.goal,
                "description": nodemap.description,
                "created_at": nodemap.created_at.isoformat() if nodemap.created_at else None,
                "is_favorite": nodemap.is_favorite # Include the new field
                # We are NOT including nodes_data and edges_data in this list endpoint
                # to keep the response size small. Fetch individual map data separately.
            })

        print(f"Successfully fetched {len(nodemaps_list)} nodemaps for user ID: {current_user_id}")
        return jsonify({"nodemaps": nodemaps_list}), 200 # OK

    except Exception as e:
        print(f"Database error during nodemap fetch for user ID {current_user_id}: {e}")
        return jsonify({"error": "An error occurred while fetching nodemaps"}), 500 # Internal Server Error
# --- End Define a route to get all Node Maps ---


# --- Updated endpoint to toggle the favorite status of a nodemap ---
# Removed the <int:nodemap_id> URL parameter
@creation_bp.route('/togglenodemapfavorite', methods=['POST'])
@jwt_required() # Protect this route
def toggle_nodemap_favorite():
    """
    Toggles the is_favorite status for a specific nodemap.
    Requires a valid JWT access token.
    Expects JSON data with 'id' for the nodemap ID in the request body.
    Ensures the nodemap belongs to the current user.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json(silent=True) # Get JSON data from the request body

    # --- Data Validation ---
    if not data:
        return jsonify({"error": "Invalid input: No data provided or invalid JSON"}), 400

    # Get the nodemap_id from the request body data
    nodemap_id = data.get('id')

    if nodemap_id is None:
        return jsonify({"error": "Nodemap ID ('id') is required in the request body"}), 400
    # --- End Data Validation ---


    try:
        # Find the nodemap by ID and user ID using the ID from the request body
        nodemap = Nodemap.query.filter_by(id=nodemap_id, user_id=current_user_id).first()

        if not nodemap:
            print(f"Attempted to toggle favorite for non-existent or unauthorized nodemap ID: {nodemap_id} by user ID: {current_user_id}")
            return jsonify({"error": "Nodemap not found or you do not have permission to edit it"}), 404 # Not Found or Forbidden

        # Toggle the is_favorite status
        nodemap.is_favorite = not nodemap.is_favorite

        db.session.commit()
        print(f"Successfully toggled favorite status for nodemap ID: {nodemap.id} to {nodemap.is_favorite} for user ID: {current_user_id}")

        # Return the updated status and the nodemap ID
        return jsonify({"message": "Favorite status updated", "is_favorite": nodemap.is_favorite, "nodemap_id": nodemap.id}), 200 # OK

    except Exception as e:
        db.session.rollback()
        print(f"Database error during favorite toggle for ID {nodemap_id}: {e}")
        return jsonify({"error": "An error occurred while toggling favorite status"}), 500 # Internal Server Error
# --- End Updated endpoint ---

# --- New endpoint to get a single Node Map's data by ID (expects ID in body) ---
@creation_bp.route('/getnodemapdata', methods=['POST']) # Changed to POST and removed URL parameter
@jwt_required() # Protect this route
def get_nodemap_data(): # Removed nodemap_id parameter from function signature
    """
    Fetches the full data (including nodes and edges) for a single nodemap by ID.
    Requires a valid JWT access token.
    Expects JSON data with 'id' for the nodemap ID in the request body.
    Ensures the nodemap belongs to the current user.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json(silent=True) # Get JSON data from the request body

    # --- Data Validation ---
    if not data:
        return jsonify({"error": "Invalid input: No data provided or invalid JSON"}), 400

    # Get the nodemap_id from the request body data
    nodemap_id = data.get('id')

    if nodemap_id is None:
        return jsonify({"error": "Nodemap ID ('id') is required in the request body"}), 400
    # --- End Data Validation ---

    try:
        # Find the nodemap by ID and user ID using the ID from the request body
        nodemap = Nodemap.query.filter_by(id=nodemap_id, user_id=current_user_id).first()

        if not nodemap:
            print(f"Attempted to fetch data for non-existent or unauthorized nodemap ID: {nodemap_id} by user ID: {current_user_id}")
            return jsonify({"error": "Nodemap not found or you do not have permission to view it"}), 404 # Not Found or Forbidden

        # Return the nodemap data, including nodes_data and edges_data
        # Parse JSON strings back to Python objects
        nodes_data = json.loads(nodemap.nodes_data) if nodemap.nodes_data else []
        edges_data = json.loads(nodemap.edges_data) if nodemap.edges_data else []

        return jsonify({
            "id": nodemap.id,
            "name": nodemap.name,
            "goal": nodemap.goal,
            "description": nodemap.description,
            "created_at": nodemap.created_at.isoformat() if nodemap.created_at else None,
            "is_favorite": nodemap.is_favorite,
            "nodes_data": nodes_data,
            "edges_data": edges_data
        }), 200 # OK

    except json.JSONDecodeError:
        print(f"JSON Decode Error for nodemap ID {nodemap_id}. Data might be corrupted.")
        return jsonify({"error": "Invalid data format for this nodemap"}), 500 # Internal Server Error
    except Exception as e:
        db.session.rollback() # Rollback in case of database error during fetch (less likely but good practice)
        print(f"Database error during single nodemap fetch for ID {nodemap_id}: {e}")
        return jsonify({"error": "An error occurred while fetching nodemap data"}), 500 # Internal Server Error
# --- End New endpoint to get a single Node Map's data ---
