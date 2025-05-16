
# Import the create_app function and db instance from your 'app' package
from app import create_app, db
# Import the User model so db.create_all() knows about it
# You need to import all models here that you want db.create_all() to create tables for.

# Create the Flask application instance using the factory function
# This is where the app, configurations, and extensions are initialized.
app = create_app()

# This conditional ensures that the Flask development server is only run
# when the script is executed directly (not when imported as a module)
if __name__ == '__main__':
  # --- Automatic Database Table Creation ---
  # Create database tables if they don't exist.
  # This needs to be done within the application context.
  # Ensure all models you want created are imported above this block.
  with app.app_context():
      db.create_all()
      print("Database tables checked/created!")
  # --- End Automatic Database Table Creation ---

  # Run the Flask application
  # debug=True enables debug mode, which provides helpful error pages
  # and automatically reloads the server when code changes.
  # In a production environment, you would use a production-ready server like Gunicorn or uWSGI.
  # You can specify the port number using the 'port' argument
  app.run(debug=True, port=5001) # Example: running on port 5001
