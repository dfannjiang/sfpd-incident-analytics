import pandas as pd

from .models import DataLoadLog, IncidentReport
from fastapi import APIRouter, HTTPException, Path, Query
from tortoise.functions import Max
from typing import List, Optional
from urllib.parse import unquote

router = APIRouter()

@router.get('/data-last-updated')
async def get_data_last_updated():
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
    categories: Optional[List[str]] = Query(None, description="The categories to filter neighborhoods by")
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
    if categories:
        data = await IncidentReport.filter(
            analysis_neighborhood=name,
            user_friendly_category__in=categories).values(*cols)
    else:
        data = await IncidentReport.filter(analysis_neighborhood=name).values(*cols)
    df = pd.DataFrame(data)
    category_counts = df.user_friendly_category.value_counts().to_dict()

    df['hour_of_day'] = df.incident_datetime.dt.hour
    counts_by_hour = df.groupby('hour_of_day').size()
    counts_by_hour_resp = []
    for i in range(24):
        try:
            count = int(counts_by_hour.loc[i])
        except KeyError:
            count = 0
        counts_by_hour_resp.append(count)
    
    return {
        "category_counts": [
            { 'name': neighborhood_name, 'count': count } for
            neighborhood_name, count in category_counts.items()
        ],
        "counts_by_hour": counts_by_hour_resp,
        "median_per_day": int(df.groupby('incident_date').size().median())

    }

@router.get('/incident-points')
async def get_incident_points():
    data = await IncidentReport.all().values('latitude', 'longitude', 'user_friendly_category')
    points = []
    for report in data:
        category = report.get('user_friendly_category')
        lat = report.get('latitude')
        lon = report.get('longitude')
        if not lat or not lon:
            continue
        points.append((lat, lon, category))
    return {
        "points": points
    }
