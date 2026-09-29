import "dotenv/config";
import express from "express";
import cors from "cors";
import bookingsRouter from "./routes/bookings.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use("/api/bookings", bookingsRouter);

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
