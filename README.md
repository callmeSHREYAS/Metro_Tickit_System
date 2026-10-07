# Metro Ticketing System

A simple Spring Boot and PostgreSQL implementation of the supplied ER diagram.

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

Use `PUT` and `DELETE` with `/{id}` for users, stations, routes, fares, and tickets. JPA creates the tables from the entities on first startup.
