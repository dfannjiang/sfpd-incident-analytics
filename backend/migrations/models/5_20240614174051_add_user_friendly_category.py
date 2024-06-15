from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" ADD "user_friendly_category" VARCHAR(80);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" DROP COLUMN "user_friendly_category";"""
