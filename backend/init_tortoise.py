from tortoise import Tortoise
import asyncio

async def init():
    await Tortoise.init(
        db_url="postgres://domfj:domfj*06*@localhost:5432/sf_analytics",
        modules={'models': ['app.models', 'aerich.models']}
    )
    await Tortoise.generate_schemas()

if __name__ == '__main__':
    asyncio.run(init())
