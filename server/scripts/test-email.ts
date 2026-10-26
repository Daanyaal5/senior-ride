// Sends ONE test email with your SMTP settings and prints what happened.
// Run from the server folder:  npm run test:email -- you@example.com
import "dotenv/config";
import { sendEmail } from "../src/services/email.js";

const to = process.argv[2];
if (!to) {
  console.log("Usage: npm run test:email -- you@example.com");
  process.exit(1);
}

// Show which settings were found (never prints the password).
console.log("SMTP_HOST:", process.env.SMTP_HOST ?? "MISSING (using localhost)");
console.log("SMTP_PORT:", process.env.SMTP_PORT ?? "MISSING (using 1025)");
console.log("SMTP_USER:", process.env.SMTP_USER ?? "none");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "found" : "none");

try {
  await sendEmail(to, "Test email", "<p>If you can read this, email sending works.</p>");
  console.log("Sent. Check the inbox (and the spam folder).");
} catch (e) {
  console.log("FAILED:", (e as Error).message);
}