from fastapi import APIRouter, HTTPException
from .models import Neighborhood
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

router = APIRouter()

@router.get('/neighborhoods/{name}')
async def get_neighborhood(name: str):
    df = pd.read_parquet('data/data.parquet')
    df = df[df.Analysis_Neighborhood == name]
    df['date'] = df.Incident_DT.dt.date
    category_counts = df.Custom_Category.value_counts().to_dict()

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
            "median_per_day": int(df.groupby('date').size().median())

        }
    raise HTTPException(status_code=404, detail="Neighborhood not found")
