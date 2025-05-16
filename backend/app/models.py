from app import db # Assuming db is initialized in app/__init__.py
from datetime import datetime
# Import JSON type from SQLAlchemy if your database supports it
# from sqlalchemy.dialects.postgresql import JSON
# Otherwise, you might store as Text and handle JSON serialization/deserialization in Python
from sqlalchemy import Text # Use Text type for broader database compatibility

# Example User model (adjust based on your actual User model)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(256)) # Store hashed passwords, not plain text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Define the relationship to Nodemap
    # 'backref' creates a 'user' attribute on the Nodemap model
    # cascade="all, delete-orphan" ensures associated nodemaps are deleted when a user is deleted
    nodemaps = db.relationship('Nodemap', backref='user', lazy=True, cascade="all, delete-orphan")

    # Define the relationship to Agent
    # 'backref' creates a 'user' attribute on the Agent model
    # cascade="all, delete-orphan" ensures associated agents are deleted when a user is deleted
    agents = db.relationship('Agent', backref='user', lazy=True, cascade="all, delete-orphan")


    def __repr__(self):
        return f'<User {self.username}>'

# Example Nodemap model (adjust based on your actual Nodemap model)
class Nodemap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    goal = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Define the foreign key relationship to the User model
    # ondelete="CASCADE" ensures that if the referenced user is deleted,
    # this nodemap will also be deleted by the database.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)

    # --- Fields to store Node Map data ---
    # Store nodes and edges data as JSON strings
    # Using Text type for compatibility, will store JSON string
    nodes_data = db.Column(Text, default='[]') # Default to empty JSON array string
    edges_data = db.Column(Text, default='[]') # Default to empty JSON array string
    # --- End fields ---

    # --- New field for favorite status ---
    is_favorite = db.Column(db.Boolean, default=False, nullable=False) # Boolean field with default False
    # --- End new field ---


    def __repr__(self):
        return f'<Nodemap {self.name}>'

# --- Agent model ---
class Agent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False) # e.g., 'text', 'image', 'chat'
    model = db.Column(db.String(100), nullable=False) # e.g., 'gpt-4o', 'gemini-pro'
    system_prompt = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Define the foreign key relationship to the User model
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)

    # Add a unique constraint on name and user_id to prevent duplicate agent names for the same user
    __table_args__ = (db.UniqueConstraint('name', 'user_id', name='_user_agent_name_uc'),)

    def __repr__(self):
        return f'<Agent {self.name}>'
# --- End Agent model ---
