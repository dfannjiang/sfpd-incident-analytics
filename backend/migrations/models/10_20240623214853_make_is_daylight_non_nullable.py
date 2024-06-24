from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" ALTER COLUMN "is_daylight" SET NOT NULL;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" ALTER COLUMN "is_daylight" DROP NOT NULL;"""
