"""
AWS Elastic Beanstalk WSGI entry point
"""
import os
import sys
from pathlib import Path

# Add the current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Load environment variables from .env file if it exists
try:
    from dotenv import load_dotenv
    env_path = current_dir / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

# Import the FastAPI app
from main import app

# Elastic Beanstalk expects the variable to be called 'application'
application = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(application, host="0.0.0.0", port=8000)
