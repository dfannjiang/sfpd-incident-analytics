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
    count_by_date = df.groupby('date').size()
    if name:
        return {
            "category_counts": df.Custom_Category.value_counts().to_dict(),
            "counts_by_hour": df.groupby('hour_of_day').size().to_dict(),
            "avg_per_day": count_by_date.mean()

        }
    raise HTTPException(status_code=404, detail="Neighborhood not found")
