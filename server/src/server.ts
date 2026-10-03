import "dotenv/config";
import express from "express";
import cors from "cors";
import bookingsRouter from "./routes/bookings.js";
import verifyRouter from "./routes/verify.js";
import { stripeWebhook } from "./routes/payments.js";
import { apiLimiter } from "./middleware/rateLimit.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.set("trust proxy", 1); // lets the rate limiter see real visitor IPs behind a host like Render
// Stripe needs the raw request body to verify its signature, so this route comes BEFORE express.json().
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());
app.use("/api", apiLimiter);
app.use("/api/verify", verifyRouter);
app.use("/api/bookings", bookingsRouter);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
