TORTOISE_ORM = {
    "connections": {
        "default": "postgres://domfj:domfj*06*@localhost:5432/sf_analytics"
    },
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}