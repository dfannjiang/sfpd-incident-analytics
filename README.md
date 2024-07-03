# SFPD Incident Analytics
I live in SF, which means I get many questions about how safe it is to live in SF or, for people who are moving to SF, which neighborhoods are safer than others, so I decided to make this [app](https://sfpd-incident-analytics.vercel.app/)! Check it out to see where and when SFPD have reported incidents, split it by the different SF neighborhoods.

## Data Source
All data is from [DataSF](https://datasf.org/opendata/)'s open data portal. Datasets used:
- [Police incident reports](https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783/about_data)
- [Neighborhood boundaries](https://data.sfgov.org/-/Analysis-Neighborhoods/j2bu-swwd/about_data)
- [SF Census data](https://data.sfgov.org/Economy-and-Community/San-Francisco-Population-and-Demographic-Census-da/4qbq-hvtt/about_data)

### Data loading/cleaning
Each day, data is pulled using [Socrata Open Data API](https://dev.socrata.com/), cleaned/transformed (see below), and stored in a [PostgreSQL](https://www.postgresql.org/) DB.

There are 2 main data tranformations:
- Each incident has an incident category and description, and based on these strings, another category is created that is more user friendly and has more specific kinds of incidents that people are more interested in.
- [Astral](https://astral.readthedocs.io/en/latest/package.html) is used to determine whether each incident occured during daylight hours or not.

## Tech Stack
**Frontend**: [React](https://react.dev/) app built with [Vite](https://vitejs.dev/). [Recharts](https://recharts.org/en-US/) for the bar charts and line graphs,
and [Leaflet](https://leafletjs.com/) for mapping.

**Backend**: Built on [FastAPI](https://fastapi.tiangolo.com/), with [PostgreSQL](https://www.postgresql.org/) DB to store data and
[TortoiseORM](https://tortoise.github.io/) + [Aerich](https://github.com/tortoise/aerich) to interface with the DB and manage DB migrations.
