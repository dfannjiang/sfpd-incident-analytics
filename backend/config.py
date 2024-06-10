TORTOISE_ORM = {
    "connections": {
        "default": "postgres://user:password@localhost/mydatabase"
    },
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}