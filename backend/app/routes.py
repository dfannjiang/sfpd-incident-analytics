import pandas as pd

from .models import IncidentReport
from fastapi import APIRouter, HTTPException, Path
from urllib.parse import unquote

router = APIRouter()

@router.get('/neighborhoods/{name:path}')
async def get_neighborhood(name: str = Path(..., description="The name of the neighborhood, URL-encoded")):
    name = unquote(name)

    data = await IncidentReport.filter(analysis_neighborhood=name).values()
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
    if name:
        return {
            "category_counts": [
                { 'name': neighborhood_name, 'count': count } for
                neighborhood_name, count in category_counts.items()
            ],
            "counts_by_hour": counts_by_hour_resp,
            "median_per_day": int(df.groupby('incident_date').size().median())

        }
    raise HTTPException(status_code=404, detail="Neighborhood not found")

@router.get('/incident-points')
async def get_incident_points():
    data = await IncidentReport.all().values()
    df = pd.DataFrame(data)
    df = df[df.latitude.notna() & df.longitude.notna()]
    points = df[['latitude', 'longitude']].values.tolist()
    return {
        "points": points
    }
