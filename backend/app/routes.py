from fastapi import APIRouter, HTTPException
from .models import Neighborhood

router = APIRouter()

@router.get('/neighborhoods/{id}')
async def get_neighborhood(id: int):
    neighborhood = await Neighborhood.get_or_none(id=id)
    if neighborhood:
        return {"name": neighborhood.name}
    raise HTTPException(status_code=404, detail="Neighborhood not found")
