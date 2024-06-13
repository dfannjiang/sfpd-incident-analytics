from tortoise import fields
from tortoise.models import Model
from enum import Enum

class DayOfWeek(Enum):
    Monday = 'Monday'
    Tuesday = 'Tuesday'
    Wednesday = 'Wednesday'
    Thursday = 'Thursday'
    Friday = 'Friday'
    Saturday = 'Saturday'
    Sunday = 'Sunday'


class IncidentReport(Model):
    row_id = fields.CharField(pk=True, max_length=80)
    incident_datetime = fields.DatetimeField()
    incident_date = fields.DateField()
    incident_year = fields.IntField()
    incident_day_of_week = fields.CharEnumField(DayOfWeek)
    report_datetime = fields.DatetimeField()
    incident_id = fields.CharField(max_length=80)
    incident_number = fields.CharField(max_length=80)
    cad_number = fields.CharField(max_length=80)
    report_type_code = fields.CharField(max_length=30)
    report_type_description = fields.CharField(max_length=80)
    filed_online = fields.BooleanField()
    incident_code = fields.CharField(max_length=30)
    incident_category = fields.CharField(max_length=80)
    incident_subcategory = fields.CharField(max_length=80)
    incident_description = fields.CharField(max_length=255)
    resolution = fields.CharField(max_length=255)
    intersection = fields.CharField(max_length=255)
    cnn = fields.CharField(max_length=80)
    police_district = fields.CharField(max_length=80)
    analysis_neighborhood = fields.CharField(max_length=80)
    latitude = fields.DecimalField(9, 6, null=True)
    longitude = fields.DecimalField(9, 6, null=True)
