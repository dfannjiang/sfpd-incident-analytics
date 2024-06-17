# SF Police Incident Reports Analytics
Wondering what kinds of crime happen in SF and where they occur? Check out this [app](https://sf-city-analytics.vercel.app/) to see
- A density map of police incident reports
- For each neighborhood, the most common kinds of incident reports and when they occur during the day

Data includes all police incident reports for the past year, updated daily.

## Data source
All data is from [DataSF](https://datasf.org/opendata/)'s open data portal. Datasets used:
- [Neighborhood boundaries](https://data.sfgov.org/-/Analysis-Neighborhoods/j2bu-swwd/about_data)
- [Police incident reports](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783/about_data)

Each day, data is pulled using [Socrata Open Data API](https://dev.socrata.com/) and stored in a [PostgreSQL](https://www.postgresql.org/) DB.

## Tech stack
**Frontend**: [React](https://react.dev/) app built with [Vite](https://vitejs.dev/). [Recharts](https://recharts.org/en-US/) for the bar charts and line graphs,
and [Leaflet](https://leafletjs.com/) for mapping.

**Backend**: Built on [FastAPI](https://fastapi.tiangolo.com/), with [PostgreSQL](https://www.postgresql.org/) DB to store data and
[TortoiseORM](https://tortoise.github.io/) + [Aerich](https://github.com/tortoise/aerich) to interface with the DB and manage DB migrations.
