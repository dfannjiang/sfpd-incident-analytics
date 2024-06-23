
import asyncio
import logging
import time


from config import DB_URL
from models import IncidentReport
from tortoise import Tortoise
from utils import is_daylight

logging.basicConfig(level=logging.INFO)

async def populate_is_daylight():
    await Tortoise.init(
        db_url=DB_URL,
        modules={'models': ['models', 'aerich.models']}
    )
    await Tortoise.generate_schemas()

    records = await IncidentReport.all()
    for record in records:
        record.is_daylight = is_daylight(record.incident_datetime)
    logging.info(f"Updated {len(records)} records. Starting bulk update")
    start = time.time()
    await IncidentReport.bulk_update(records,
                                     fields=["is_daylight"])
    logging.info(f"Finished bulk updating in {round(time.time() - start, 2)}s")
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(populate_is_daylight())
