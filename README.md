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

## Stripe payments
1. In server/.env set `STRIPE_SECRET_KEY` (Stripe Dashboard > Developers > API keys, test mode).
2. Existing database: run `server/src/migrations/002_payment_status.sql` once.
3. Local webhook: install the Stripe CLI, run `stripe listen --forward-to localhost:3001/api/payments/webhook`, and put the `whsec_...` it prints in `STRIPE_WEBHOOK_SECRET`.
4. Test card: 4242 4242 4242 4242, any future date, any CVC.
5. Live: add a webhook endpoint in the Stripe Dashboard for `checkout.session.completed` pointing at `https://YOUR-API/api/payments/webhook`.

## Phone verification (text-message code)
Uses Twilio Verify: create a Verify Service in the Twilio console and set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SID`. Set `VERIFY_SECRET` to any long random string. With `MOCK_MODE=true` no text is sent and the code is always 123456.
