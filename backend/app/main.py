import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from .routes import router
from .config import TORTOISE_ORM

app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "")
origins = allowed_origins.split(",") if allowed_origins else []
origins.append("http://localhost:5173")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down...")

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Running on port {port}")
    uvicorn.run(app, host='0.0.0.0', port=port)
