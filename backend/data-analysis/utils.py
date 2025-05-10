from datetime import datetime
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
from sodapy import Socrata
from astral import LocationInfo
from astral.sun import sun
from pytz import timezone
import pandas as pd
import os
import re

load_dotenv()
SOCRATA_APP_TOKEN = os.environ.get("SOCRATA_APP_TOKEN")

sf_city = LocationInfo('San Francisco', 'America', "America/Los_Angeles", latitude=37.773972, longitude=-122.431297)
sf_local_tz = timezone(sf_city.timezone)
def localize_to_sf(dt):
    return sf_local_tz.localize(dt)

def not_tz_aware(dt):
    return dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None

def is_daylight(dt):
    if not_tz_aware(dt):
      dt = localize_to_sf(dt)
    
    # Convert to sf timezone before checking is_daylight
    converted_dt = dt.astimezone(sf_local_tz)
    s = sun(sf_city.observer, date=converted_dt.date(), tzinfo=sf_local_tz)
    return s['sunrise'] <= converted_dt <= s['sunset']

def compute_user_friendly_category(
  incident_category,
  incident_description
):
    if not incident_category or not incident_description:
        return None

    inc_desc = incident_description.strip().lower()
    inc_category = incident_category.strip().lower()
    if re.match('malicious\s*mischief', inc_category):
        if 'vandalism' in inc_desc:
            return 'Vandalism'
        else:
            return incident_category
    elif re.match('larceny\s*theft', inc_category):
        if 'vehicle' in inc_desc:
            return 'Theft from vehicle'
        elif 'shoplifting' in inc_desc:
            return 'Shoplifting'
        elif 'building' in inc_desc:
            return 'Theft from building'
        elif re.match('license\s*plate', inc_desc):
            return 'License Plate Issues'
        else:
            return  'Misc Larceny Theft'
    elif re.match('other\s*miscellaneous', inc_category):
        if 'trespassing' in inc_desc:
            return 'Trespassing'
        elif re.match('investigative\s*detention', inc_desc):
            return 'Investigative Detention'
        elif 'driving' in inc_desc:
            return 'Driving Violations and Offenses'
        elif 'resisting' in inc_desc and 'officer' in inc_desc:
            return 'Resisting an Officer'
        elif 'conspiracy' in inc_desc:
            return 'Conspiracy'
        elif re.match('probation\s+violation', inc_desc):
            return 'Probation Violation'
    elif 'other' == inc_category:
        return 'Death Report'
    elif re.match('other\s*offenses', inc_category):
        if re.match('.*license\s+plate.*', inc_desc):
            return 'License Plate Issues'
    
    if re.match('.*evading.*police.*', inc_desc):
        return 'Evading Police'
    if re.match('.*parole.*violation.*', inc_desc):
        return 'Parole Violation'

    if re.match('other\s*miscellaneous', inc_category) or \
            re.match('other\s*offenses', inc_category) or \
            inc_category == 'other':
        if 'violation' in inc_desc:
            return 'Code Violation'
        return 'Other'

    return re.sub('[^A-Za-z0-9\s-]+', '', incident_category.strip())

def get_data(num_years):
  SOCRATA_URL = "data.sfgov.org"
  INCIDENTS_DATASET_ID = "wg3w-h783"
  datetime_format = '%Y-%m-%dT%H:%M:%S.%f'
  today = datetime.today()
  cutoff_date = today - relativedelta(years=num_years)
  cutoff_date_str = cutoff_date.strftime(datetime_format)
  existing_ids = set()
  new_incidents = []
  with Socrata(SOCRATA_URL, SOCRATA_APP_TOKEN, timeout=20) as socrata_client:
    for raw_incident in socrata_client.get_all(INCIDENTS_DATASET_ID, 
        where=f"incident_datetime >= '{cutoff_date_str}'",
        limit=10000):
      id = raw_incident.get('row_id')
      if id and id in existing_ids:
        continue
      existing_ids.add(id)

      incident_dt_str = raw_incident.get('incident_datetime')
      if incident_dt_str:
        incident_dt = datetime.strptime(incident_dt_str, datetime_format)
      else:
         incident_dt = None
      new_incidents.append((
        id,
        incident_dt,
        raw_incident.get('incident_year'),
        raw_incident.get('incident_day_of_week'),
        raw_incident.get('report_datetime'),
        raw_incident.get('incident_id'),
        raw_incident.get('incident_number'),
        raw_incident.get('cad_number'),
        raw_incident.get('report_type_code'),
        raw_incident.get('report_type_description'),
        raw_incident.get('filed_online'),
        raw_incident.get('incident_code'),
        raw_incident.get('incident_category'),
        raw_incident.get('incident_subcategory'),
        raw_incident.get('incident_description'),
        raw_incident.get('resolution'),
        raw_incident.get('intersection'),
        raw_incident.get('cnn'),
        raw_incident.get('police_district'),
        raw_incident.get('analysis_neighborhood'),
        raw_incident.get('latitude'),
        raw_incident.get('longitude'),
        compute_user_friendly_category(raw_incident.get('incident_category'), raw_incident.get('incident_description')),
      ))

  return pd.DataFrame(new_incidents, columns=[
    'id', 'incident_datetime', 'incident_year', 'incident_day_of_week',
    'report_datetime', 'incident_id', 'incident_number', 'cad_number', 'report_type_code',
    'report_type_description', 'filed_online', 'incident_code', 'incident_category',
    'incident_subcategory', 'incident_description', 'resolution', 'intersection',
    'cnn', 'police_district', 'neighborhood', 'lat', 'lon', 'user_friendly_category'
  ])