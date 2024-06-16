import asyncio
from tortoise import Tortoise
from app.config import TORTOISE_ORM

async def init():
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(init())
  