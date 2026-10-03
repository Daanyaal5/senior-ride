-- Run once to create the bookings table.
CREATE TABLE IF NOT EXISTS bookings (
  id                 SERIAL PRIMARY KEY,
  reference          TEXT UNIQUE NOT NULL,          -- e.g. TXI-48213, shown to the customer
  name               TEXT NOT NULL,
  phone              TEXT NOT NULL,
  secondary_phone    TEXT NOT NULL,                 -- family contact
  email              TEXT NOT NULL,
  pickup_address     TEXT NOT NULL,
  pickup_lat         DOUBLE PRECISION NOT NULL,
  pickup_lng         DOUBLE PRECISION NOT NULL,
  dropoff_address    TEXT NOT NULL,
  dropoff_lat        DOUBLE PRECISION NOT NULL,
  dropoff_lng        DOUBLE PRECISION NOT NULL,
  is_asap            BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_time     TIMESTAMPTZ,                   -- NULL for ASAP rides
  extra_care         BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_language TEXT NOT NULL,
  estimated_fare     NUMERIC(8,2) NOT NULL,
  status             TEXT NOT NULL DEFAULT 'new',   -- new | assigned | completed | cancelled
  payment_status     TEXT NOT NULL DEFAULT 'unpaid',  -- unpaid | paid
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
