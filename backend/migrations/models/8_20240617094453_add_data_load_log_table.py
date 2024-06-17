from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "dataloadlog" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "start_dt" TIMESTAMPTZ NOT NULL,
    "end_dt" TIMESTAMPTZ NOT NULL,
    "failed" BOOL NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        DROP TABLE IF EXISTS "dataloadlog";"""
