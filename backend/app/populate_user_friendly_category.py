import asyncio
import logging
import time

from config import DB_URL
from tortoise import Tortoise
from .models import IncidentReport
from utils import compute_user_friendly_category

logging.basicConfig(level=logging.INFO)

async def populate_user_friendly_category():
    await Tortoise.init(
        db_url=DB_URL,
        modules={'models': ['models', 'aerich.models']}
    )
    await Tortoise.generate_schemas()

    records = await IncidentReport.all()
    for record in records:
        record.user_friendly_category = compute_user_friendly_category(
            record.incident_category,
            record.incident_description
        )
    logging.info(f"Updated {len(records)} records. Starting bulk update")
    start = time.time()
    await IncidentReport.bulk_update(records,
                                     fields=["user_friendly_category"])
    logging.info(f"Finished bulk updating in {round(time.time() - start, 2)}s")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(populate_user_friendly_category())
