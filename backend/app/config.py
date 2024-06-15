from dotenv import dotenv_values

# Load environment variables from .env file into a dictionary
env_vars = dotenv_values(".env")

# Access the variables
DB_USERNAME = env_vars["DB_USERNAME"]
DB_PASSWORD = env_vars["DB_PASSWORD"]
DB_NAME = env_vars["DB_NAME"]
DB_PORT = env_vars["DB_PORT"]
SOCRATA_APP_TOKEN = env_vars["SOCRATA_APP_TOKEN"]
DB_URL = f"postgres://{DB_USERNAME}:{DB_PASSWORD}@localhost:{DB_PORT}/{DB_NAME}"

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