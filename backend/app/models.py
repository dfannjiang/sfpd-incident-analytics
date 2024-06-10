from tortoise import fields
from tortoise.models import Model

class Neighborhood(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=80)
    # Add other fields as needed
