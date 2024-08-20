import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from logging.config import dictConfig
from tortoise.contrib.fastapi import register_tortoise
import uvicorn
from .routes import router
from .config import TORTOISE_ORM

app = FastAPI()

allowed_origins = os.environ.get("ALLOWED_ORIGINS", "")
origins = allowed_origins.split(",") if allowed_origins else []

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=500)

app.include_router(router)

register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=True,
    add_exception_handlers=True,
)

@app.on_event("startup")
async def startup_event():
    print("Starting up...")


LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(levelname)s %(name)s [%(process)d:%(threadName)s] - %(message)s",
        },
    },
    "handlers": {
        "default": {
            "level": "INFO",
            "formatter": "default",
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "": {"handlers": ["default"], "level": "INFO"},
    },
}
dictConfig(LOGGING_CONFIG)

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down...")

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    print(f"Running on port {port}")
    uvicorn.run(app, host='0.0.0.0', port=port, log_config=LOGGING_CONFIG)
