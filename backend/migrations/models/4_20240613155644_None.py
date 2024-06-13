from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "incidentreport" (
    "row_id" VARCHAR(80) NOT NULL  PRIMARY KEY,
    "incident_datetime" TIMESTAMPTZ NOT NULL,
    "incident_date" DATE NOT NULL,
    "incident_year" INT NOT NULL,
    "incident_day_of_week" VARCHAR(9) NOT NULL,
    "report_datetime" TIMESTAMPTZ NOT NULL,
    "incident_id" VARCHAR(80) NOT NULL,
    "incident_number" VARCHAR(80) NOT NULL,
    "cad_number" VARCHAR(80) NOT NULL,
    "report_type_code" VARCHAR(30) NOT NULL,
    "report_type_description" VARCHAR(80) NOT NULL,
    "filed_online" BOOL NOT NULL,
    "incident_code" VARCHAR(30) NOT NULL,
    "incident_category" VARCHAR(80) NOT NULL,
    "incident_subcategory" VARCHAR(80) NOT NULL,
    "incident_description" VARCHAR(255) NOT NULL,
    "resolution" VARCHAR(255) NOT NULL,
    "intersection" VARCHAR(255) NOT NULL,
    "cnn" VARCHAR(80) NOT NULL,
    "police_district" VARCHAR(80) NOT NULL,
    "analysis_neighborhood" VARCHAR(80) NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6)
);
COMMENT ON COLUMN "incidentreport"."incident_day_of_week" IS 'Monday: Monday\nTuesday: Tuesday\nWednesday: Wednesday\nThursday: Thursday\nFriday: Friday\nSaturday: Saturday\nSunday: Sunday';
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
