import rateLimit from "express-rate-limit";

const message = { error: "Too many requests. Please wait a few minutes and try again." };
const base = { standardHeaders: true, legacyHeaders: false, message };

// Every /api route: at most 300 requests per visitor (IP address) every 15 minutes.
export const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 300 });

// Bookings and card payments: at most 10 per visitor per hour, to stop spam and people testing stolen cards.
export const bookingLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 10 });