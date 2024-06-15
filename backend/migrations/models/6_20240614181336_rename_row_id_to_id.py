from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" RENAME COLUMN "row_id" TO "id";"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        ALTER TABLE "incidentreport" RENAME COLUMN "id" TO "row_id";"""
