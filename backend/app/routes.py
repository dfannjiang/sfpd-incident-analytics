import pandas as pd
import time
import logging

from aiocache import cached, SimpleMemoryCache
from datetime import datetime
from dateutil.relativedelta import relativedelta
from .models import DataLoadLog, IncidentReport
from fastapi import APIRouter, HTTPException, Path, Query
from fastapi.responses import JSONResponse
from tortoise.functions import Max
from typing import List, Optional, Tuple
from urllib.parse import unquote
from .utils import sf_local_tz

######
# NOTE: Tortoise ORM converts and returns datetime values to UTC
######
router = APIRouter()

def get_cutoff_date(time_period: str) -> Tuple[datetime, datetime]:
    today = datetime.today()
    if time_period == '1YEAR':
        cutoff_date = today - relativedelta(years=1)
    elif time_period == '3MONTH':
        cutoff_date = today - relativedelta(months=3)
    elif time_period == '1MONTH':
        cutoff_date = today - relativedelta(months=1)
    elif time_period == '1WEEK':
        cutoff_date = today - relativedelta(weeks=1)
    else:
        raise HTTPException(status_code=404, detail=f"Invalid time period: {time_period}")
    return today, cutoff_date

def get_db_filters(
    categories: Optional[List[str]],
    time_period: str,
    is_daylight: Optional[bool]
) -> str:
    filters = {}
    if categories:
        filters['user_friendly_category__in'] = categories
    _, cutoff_date = get_cutoff_date(time_period)
    filters['incident_datetime__gt'] = cutoff_date
    if is_daylight is not None:
        filters['is_daylight'] = is_daylight
    return filters
    

@router.get('/data-last-updated')
async def get_data_last_updated():
    # Returns the last updated datetime in UTC
    max_end_dt = await DataLoadLog.filter(failed=False).annotate(max_value=Max('end_dt')).values("max_value")
    last_updated = max_end_dt[0]['max_value'] if max_end_dt else None
    if last_updated:
        return { 'last_updated': last_updated.strftime('%Y-%m-%dT%H:%M:%S.%f') }
    else:
        return { 'last_updated': None }

@router.get('/incident-categories')
async def get_incident_categories():
    categories = await IncidentReport.all().distinct().values_list('user_friendly_category', flat=True)
    return { 'categories': [cat for cat in categories if bool(cat)] }

@router.get('/neighborhoods/{name:path}')
async def get_neighborhood(
    name: str = Path(..., description="The name of the neighborhood, URL-encoded"),
    categories: Optional[List[str]] = Query(None, description="The categories to filter neighborhoods by"),
    time_period: str = '1YEAR',
    is_daylight: Optional[bool] = None
):
    if not name:
        raise HTTPException(status_code=404, detail="Neighborhood not found")
    name = unquote(name)
    cols = [
        'analysis_neighborhood',
        'user_friendly_category',
        'incident_datetime',
        'incident_date'
    ]

    filters = get_db_filters(categories, time_period, is_daylight)
    filters["analysis_neighborhood"] = name

    start = time.time()
    data = await IncidentReport.filter(**filters, join_type='AND').values(*cols)
    logging.info(f'Getting IncidentReport with filters {filters} took {time.time() - start}s')
    df = pd.DataFrame(data)
    if df.shape[0] == 0:
        return {
            "category_counts": [],
            "counts_by_hour": [],
            "median_per_day": 0,
            "counts_by_day": []
        }
    
    # Converting because Tortoise ORM always returns datetime in UTC
    df['incident_datetime_local'] = df.incident_datetime.dt.tz_convert(sf_local_tz)
    df['incident_date_local'] = df.incident_datetime_local.dt.date

    counts_by_date = df.groupby('incident_date_local').size()
    category_counts = df.user_friendly_category.value_counts().to_dict()

    df['hour_of_day'] = df.incident_datetime_local.dt.hour
    counts_by_hour = df.groupby('hour_of_day').size()
    counts_by_hour_resp = []
    for i in range(24):
        try:
            count = int(counts_by_hour.loc[i])
        except KeyError:
            count = 0
        counts_by_hour_resp.append(count)

    today, cutoff_date = get_cutoff_date(time_period)
    date_range = pd.date_range(start=cutoff_date, end=today-relativedelta(days=1))
    counts_by_day = []
    for dt in date_range:
        try:
            count = int(counts_by_date.loc[dt.date()])
        except KeyError:
            count = 0
        counts_by_day.append({ "day": dt.date(), "count": count })
    
    logging.info(f'get_neighborhood filters {filters} took {time.time() - start}s')

    return {
        "category_counts": [
            { 'name': neighborhood_name, 'count': count } for
            neighborhood_name, count in category_counts.items()
        ],
        "counts_by_hour": counts_by_hour_resp,
        "median_per_day": int(df.groupby('incident_date_local').size().median()),
        "counts_by_day": counts_by_day
    }

@cached(ttl=60*5, cache=SimpleMemoryCache)  
async def get_points_for_map():
    data = await IncidentReport.all().values('latitude', 'longitude',
                                             'user_friendly_category',
                                             'incident_datetime', 'is_daylight')
    points = []
    for report in data:
        category = report.get('user_friendly_category')
        lat = report.get('latitude')
        lon = report.get('longitude')
        incident_datetime = report.get('incident_datetime')
        is_daylight = report.get('is_daylight')
        if not lat or not lon:
            continue
        points.append((
            str(lat),
            str(lon),
            category,
            incident_datetime.astimezone(sf_local_tz).strftime("%Y-%m-%dT%H:%M:%S%z"),
            is_daylight))
    return points

# Cache the results for 5min
@router.get('/incident-points')
async def get_incident_points():
    start = time.time()
    points = await get_points_for_map()
    logging.info(f'get_points_for_map took {time.time() - start}s')
    resp_body = {'points': points}
    return JSONResponse(content=resp_body)