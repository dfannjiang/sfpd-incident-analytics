from fastapi import FastAPI
from tortoise.contrib.fastapi import register_tortoise
from .routes import router
from config import TORTOISE_ORM

app = FastAPI()

app.include_router(router)

# register_tortoise(
#     app,
#     config=TORTOISE_ORM,
#     generate_schemas=True,
#     add_exception_handlers=True,
# )

@app.on_event("startup")
async def startup_event():
    print("Starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    print("Shutting down...")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
