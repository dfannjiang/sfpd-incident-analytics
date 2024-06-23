import re

from astral import LocationInfo
from astral.sun import sun
from pytz import timezone

def compute_user_friendly_category(
  incident_category,
  incident_description
):
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

sf_city = LocationInfo('San Francisco', 'America', "America/Los_Angeles", latitude=37.773972, longitude=-122.431297)
sf_local_tz = timezone(sf_city.timezone)

def not_tz_aware(dt):
    return dt.tzinfo is None or dt.tzinfo.utcoffset(dt) is None

def is_daylight(dt):
    if not_tz_aware(dt):
      dt = sf_local_tz.localize(dt)
    s = sun(sf_city.observer, date=dt.date(), tzinfo=sf_local_tz)
    return s['sunrise'] <= dt <= s['sunset']