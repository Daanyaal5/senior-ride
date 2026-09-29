# Senior Ride

Ride booking for seniors: scheduled or ASAP rides, Extra Care option, family contact, preferred driver language, Google Maps address search and a server-calculated fare estimate. You assign drivers yourself from the bookings list.

## Setup
1. Create a Postgres database and run `server/src/db/schema.sql`.
2. `cd server && cp .env.example .env` (fill in values) then `npm install && npm run dev`.
3. `cd client && cp .env.example .env` (add your Google key) then `npm install && npm run dev`.
4. Add a looping muted video at `client/public/hero.mp4`.
5. Open http://localhost:5173

## Google APIs to enable
Maps JavaScript API, Places API, Routes API. Use one browser key (client, restricted by website) and one server key (Routes API, restricted by IP).

## See your bookings
`GET /api/bookings` with header `x-admin-key: <ADMIN_KEY from server/.env>`.

## Tune prices
Edit `server/src/config/pricing.ts`.
