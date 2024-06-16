import os
from dotenv import load_dotenv

# Load environment variables from .env file into a dictionary
load_dotenv()

# Access the variables
DB_USERNAME = os.environ.get("DB_USERNAME")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_NAME = os.environ.get("DB_NAME")
DB_PORT = os.environ.get("DB_PORT")
SOCRATA_APP_TOKEN = os.environ.get("SOCRATA_APP_TOKEN")
DEV_DB_URL = f"postgres://{DB_USERNAME}:{DB_PASSWORD}@localhost:{DB_PORT}/{DB_NAME}"
DB_URL = os.environ.get("DATABASE_URL", DEV_DB_URL)

TORTOISE_ORM = {
    "connections": {
        "default": DB_URL
    },
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}