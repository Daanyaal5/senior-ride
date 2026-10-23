import nodemailer from "nodemailer";

/**
 * Sends email over SMTP. Free options:
 * - Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465, SMTP_USER=your Gmail, SMTP_PASS=a Gmail "app password".
 * - Mailpit (testing on your computer): SMTP_HOST=localhost, SMTP_PORT=1025, no user or password.
 */
const transport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: Number(process.env.SMTP_PORT) === 465, // port 465 uses encryption from the start
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });

const FROM = () => `"${process.env.BUSINESS_NAME ?? "Halifax Accessible, Mobility, and Airport Transfers"}" <${process.env.SMTP_USER || "bookings@example.test"}>`;

/** Sends one email. replyTo lets the business reply straight to the customer. */
export async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<void> {
  try {
    await transport().sendMail({ from: FROM(), to, subject, html, replyTo });
  } catch (e) {
    throw new Error(`Email could not be sent (${(e as Error).message}). Check SMTP settings in server/.env.`);
  }
}