from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" ALTER COLUMN "user_friendly_category" SET NOT NULL;"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" ALTER COLUMN "user_friendly_category" DROP NOT NULL;"""
