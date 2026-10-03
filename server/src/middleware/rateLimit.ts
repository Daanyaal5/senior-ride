import rateLimit from "express-rate-limit";

const message = { error: "Too many requests. Please wait a few minutes and try again." };
const base = { standardHeaders: true, legacyHeaders: false, message };

// Every /api route: at most 300 requests per visitor (IP address) every 15 minutes.
export const apiLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, limit: 300 });

// Creating bookings: at most 10 per visitor per hour, to stop spam bookings.
export const bookingLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 10 });

// Sending text-message codes: at most 5 per visitor per hour. Each text costs money, so this blocks abuse.
export const verifyLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, limit: 5 });