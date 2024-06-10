from fastapi import APIRouter, HTTPException
from .models import Neighborhood

router = APIRouter()

@router.get('/neighborhoods/{name}')
async def get_neighborhood(name: str):
    if name:
        return {"incident_counts": {"larceny": 5513, "robbery": 2341}}
    raise HTTPException(status_code=404, detail="Neighborhood not found")
