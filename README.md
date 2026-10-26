# Halifax Accessible, Mobility, and Airport Transfers

A simple booking website: customers pick addresses (Google autocomplete, with a one-tap airport button), choose a time, see a fixed price (tax included), and pay by card (Square) or Interac e-Transfer. Each booking is emailed to the business and the customer. No database and no paid messaging service.

## Setup
1. `cd server && cp .env.example .env` (fill in values) then `npm install && npm run dev`.
2. `cd client && cp .env.example .env` (fill in values) then `npm install && npm run dev`.
3. Open http://localhost:5173

## Where to change things
- Prices, areas and the Extra Care rate: `server/src/config/pricing.ts`
- Business name, phone, WhatsApp, emails: `client/src/utils/brand.ts` and the business lines in `server/.env`
- Booking policy wording: `client/src/pages/Terms.tsx`

## Emails (free)
- Testing: install Mailpit (`brew install mailpit`, then run `mailpit`) and read emails at http://localhost:8025.
- Real emails: use a Gmail account with an app password (`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`).
- Test your settings: `cd server && npm run test:email -- you@example.com`.

## Square payments
1. Create an application in the Square Developer Dashboard.
2. Sandbox Access token and Location ID go in `server/.env`. Sandbox Application ID and Location ID go in `client/.env`.
3. To go live, switch both files to your production values and set the environment to `production`.
Card payments, saved cards and refunds are all managed in the Square Dashboard.

## Google
Enable Maps JavaScript API and Places API, with one browser key restricted to your website.