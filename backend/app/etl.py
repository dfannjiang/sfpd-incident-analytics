import csv
from datetime import datetime
from dateutil.relativedelta import relativedelta
from io import StringIO
import logging
from sodapy import Socrata
from tortoise.transactions import in_transaction

APP_TOKEN = "H942SbOtZ5xKAvw4O1QHwZRJt"
SOCRATA_URL = "sandbox.demo.socrata.com"
INCIDENTS_DATASET_ID = "wg3w-h783"
def inital_load():
  datetime_format = '%Y-%m-%dT%H:%M:%S'
  today = datetime.today()
  two_years_ago = today - relativedelta(years=2)
  two_years_ago_str = two_years_ago.strftime(datetime_format)

  insert_batch_size = 10000
  new_incidents = [] 
  num_batches = 0
  num_skipped = 0
  num_success = 0
  with Socrata(SOCRATA_URL, APP_TOKEN) as socrata_client:
    for raw_incident in client.get_all(INCIDENTS_DATASET_ID, 
        where=f"incident_datetime >= '{two_years_ago_str}'"):
      analysis_neighborhood = raw_incident.get('analysis_neighborhood')
      if not analysis_neighborhood:
        num_skipped += 1
        continue
      
      try:
        incident_datetime = datetime.strptime(
          raw_incident.get('incident_datetime'),
          datetime_format)
        new_incidents.append((
          raw_incident.get('row_id'),
          incident_datetime,
          incident_datetime.date(),
          raw_incident.get('incident_year') or "",
          raw_incident.get('incident_day_of_week') or "",
          datetime.strptime(raw_incident.get('report_datetime'), datetime_format)
          raw_incident.get('incident_id') or "",
          raw_incident.get('incident_number') or "",
          raw_incident.get('cad_number') or "",
          raw_incident.get('report_type_code') or "",
          raw_incident.get('report_type_description') or "",
          raw_incident.get('filed_online') or False,
          raw_incident.get('incident_code') or "",
          raw_incident.get('incident_category') or "",
          raw_incident.get('incident_subcategory') or "",
          raw_incident.get('incident_description') or "",
          raw_incident.get('resolution') or "",
          raw_incident.get('cnn') or "",
          raw_incident.get('police_district') or "",
          analysis_neighborhood,
          float(raw_incident.get('latitude')),
          float(raw_incident.get('longitude'))
        ))
      except Exception as e:
        logging.error(f'Failed to read raw incident from socrata: {str(e)}. Skipping')
        num_skipped += 1
        continue
      
      if len(new_incidents) == insert_batch_size:
        try:
          buffer = StringIO()
          writer = csv.writer(buffer)
          writer.writerows(new_incidents)
          buffer.seek(0)
          with in_transaction() as conn:
            query = "COPY my_table (column1, column2, column3) FROM STDIN WITH CSV"
            conn.execute_query(query, [buffer.getvalue()])
          num_success += len(new_incidents)
          num_batches += 1
        except Exception as e:
          logging.error(f'Failed to write to DB: {str(e)}. Skipping')
          num_skipped += len(new_incidents)
        finally:
          new_incidents = []

  logging.info(
    f'Inserted {num_success} incidents across {num_batches} batches. '
    f'Skipped {num_skipped} incidents.'
  )
