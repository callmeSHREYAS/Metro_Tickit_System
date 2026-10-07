# Metro Ticketing System

A local-first Spring Boot and PostgreSQL metro ticketing app. Passengers can compare fares, book rides, view tickets, and top up a metro card. Admins can manage riders, stations, fares, trains, schedules, route stops, and maintenance issues. Demo data is loaded on the first startup; no external API keys or paid services are needed.

## Frontend

The React frontend is bundled locally into Spring Boot's static resources, so the
running application does not depend on a React CDN. After changing the frontend,
run `npm install` once and `npm run build` before starting the Spring Boot app.
For frontend development with hot reload, run `npm run dev` while the backend is
available at `http://localhost:8080`; Vite proxies `/api` requests to it.

## Run with Docker

From this directory:

```bash
docker compose up --build
```

The API is available at `http://localhost:8080`.

Stop it with:

```bash
docker compose down
```

The database data remains in the `postgres_data` volume. To remove it too, run `docker compose down -v`.

## API examples

All endpoints use JSON and are under `/api`:

- `GET /api/users`, `POST /api/users`
- `GET /api/stations`, `POST /api/stations`
- `GET /api/routes`, `POST /api/routes`
- `GET /api/fares`, `POST /api/fares`
- `GET /api/tickets`, `POST /api/tickets`
- `GET /api/payments`, `POST /api/payments`
- `GET /api/cards`, `POST /api/cards`
- `GET /api/trains`, `POST /api/trains`
- `GET /api/schedules`, `POST /api/schedules`
- `GET /api/route-stations`, `POST /api/route-stations`
- `GET /api/maintenance-issues`, `POST /api/maintenance-issues`

Use `PUT` and `DELETE` with `/{id}` for editable resources. Route stops use an automatically generated numeric ID and support `DELETE`. JPA creates the tables from the entities on first startup. The admin Operations page shows records across all 11 database tables and provides simple forms for adding fleet, timetable, route-stop, card, and maintenance data.
