# Internal-Novel-Web

Skeleton project for React + Spring Boot + Railway Postgres.

Structure:
- `backend/` Spring Boot API (Flyway migrations included)
- `frontend/` React app (Vite)

Quick start:
- Backend: `mvn -q -f backend/pom.xml spring-boot:run`
- Frontend: `cd frontend; npm install; npm run dev`

Config:
- Frontend: copy `frontend/.env.example` to `frontend/.env`.
- Backend: set env vars from `.env.example` (or Railway variables) before running.
- Railway: set `JDBC_DATABASE_URL` to the Postgres JDBC URL (or map PG* vars), then run the schema from `Db.txt`.
