import asyncio
import asyncpg
import functools
import logging
import time
import traceback

from config import DB_URL, SOCRATA_APP_TOKEN
from .models import IncidentReport
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sodapy import Socrata
from tortoise import Tortoise
from utils import compute_user_friendly_category


logging.basicConfig(level=logging.INFO)
SOCRATA_URL = "data.sfgov.org"
INCIDENTS_DATASET_ID = "wg3w-h783"

def async_log_time(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = await func(*args, **kwargs)
        end_time = time.perf_counter()
        duration = end_time - start_time
        logging.info(f"{func.__name__} took {duration:.4f} seconds to complete.")
        return result
    return wrapper

@async_log_time
async def insert_into_db(values, batch_num):
  try:
    logging.info(f'Batch: {batch_num}: attempting to insert {len(values)} rows')
    conn = await asyncpg.connect(DB_URL)
    async with conn.transaction():
      await conn.copy_records_to_table('incidentreport', records=values)
    logging.info(f'Batch: {batch_num}: inserted {len(values)} rows')
    return len(values), 0
  except Exception as e:
    logging.error(f'Failure to create data in DB: {str(e)}. Traceback: {traceback.format_exc()}')
    return 0, len(values)
  
@async_log_time
async def delete_old_incidents():
  today = datetime.today()
  cutoff_date = today - relativedelta(years=1)
  logging.info(f"Attempting to delete incidents before {str(cutoff_date)}")
  deleted_num = await IncidentReport.filter(incident_datetime__lt=cutoff_date).delete()
  logging.info(f"Successfully deleted {deleted_num} incidents before {str(cutoff_date)}")

@async_log_time
async def get_existing_row_ids():
  logging.info(f'Getting all existing row ids')
  ids = await IncidentReport.all().values_list('row_id', flat=True)
  logging.info(f'Got {len(ids)} existing row ids')
  return set(ids)

@async_log_time
async def data_update():
  datetime_format = '%Y-%m-%dT%H:%M:%S.%f'
  today = datetime.today()
  cutoff_date = today - relativedelta(years=1)
  cutoff_date_str = cutoff_date.strftime(datetime_format)
  existing_row_ids = await get_existing_row_ids()

  insert_batch_size = 10000
  new_incidents = [] 
  num_skipped = 0
  db_tasks = []
  num_batches = 0
  with Socrata(SOCRATA_URL, SOCRATA_APP_TOKEN, timeout=20) as socrata_client:
    for raw_incident in socrata_client.get_all(INCIDENTS_DATASET_ID, 
        where=f"incident_datetime >= '{cutoff_date_str}'",
        limit=10000):
      
      row_id = raw_incident.get('row_id')
      if not row_id:
        num_skipped += 1
        continue

      if row_id in existing_row_ids:
        num_skipped += 1
        continue
      existing_row_ids.add(row_id)

      analysis_neighborhood = raw_incident.get('analysis_neighborhood')
      if not analysis_neighborhood:
        num_skipped += 1
        continue

      incident_dt_str = raw_incident.get('incident_datetime')
      if not incident_dt_str:
        num_skipped += 1
        continue

      incident_dt = datetime.strptime(incident_dt_str, datetime_format)
      if incident_dt < cutoff_date:
        num_skipped += 1
        continue
      
      try:
        incident_category = raw_incident.get('incident_category') or "",
        incident_description = raw_incident.get('incident_description') or ""


        new_incidents.append((
          row_id,
          incident_dt,
          incident_dt.date(),
          int(raw_incident.get('incident_year')),
          raw_incident.get('incident_day_of_week') or "",
          datetime.strptime(raw_incident.get('report_datetime'), datetime_format),
          raw_incident.get('incident_id') or "",
          raw_incident.get('incident_number') or "",
          raw_incident.get('cad_number') or "",
          raw_incident.get('report_type_code') or "",
          raw_incident.get('report_type_description') or "",
          raw_incident.get('filed_online') or False,
          raw_incident.get('incident_code') or "",
          incident_category,
          raw_incident.get('incident_subcategory') or "",
          incident_description,
          raw_incident.get('resolution') or "",
          raw_incident.get('intersection') or "",
          raw_incident.get('cnn') or "",
          raw_incident.get('police_district') or "",
          analysis_neighborhood,
          float(raw_incident.get('latitude')),
          float(raw_incident.get('longitude')),
          compute_user_friendly_category(incident_category, incident_description)
        ))
      except Exception as e:
        logging.error(f'Skipping failure to read raw incident from socrata: {str(e)}. Traceback: {traceback.format_exc()}')
        num_skipped += 1
        continue
      
      if len(new_incidents) == insert_batch_size:
        db_tasks.append(insert_into_db(new_incidents, num_batches))
        new_incidents = []
        num_batches += 1

  if len(new_incidents) > 0:
    db_tasks.append(insert_into_db(new_incidents, num_batches))
    num_batches += 1

  results = await asyncio.gather(*db_tasks)
  num_failed = 0
  num_success = 0
  for succeeded, failed in results:
    if succeeded:
      num_success += succeeded
    if failed:
      num_failed += failed

  await delete_old_incidents()
        
  logging.info(
    f'Inserted {num_success} incidents across {num_batches} batches\n'
    f'Skipped: {num_skipped}\n'
    f'Failed: {num_failed}'
  )

async def main():
    await Tortoise.init(
        db_url=DB_URL,
        modules={'models': ['models', 'aerich.models']}
    )
    await Tortoise.generate_schemas()
    await data_update() 
    await Tortoise.close_connections()

if __name__ == '__main__':
  asyncio.run(main())
