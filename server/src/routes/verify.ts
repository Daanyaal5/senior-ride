import { Router } from "express";
import { sendCode, checkCode, makeToken, toE164 } from "../services/verify.js";
import { verifyLimiter } from "../middleware/rateLimit.js";

const router = Router();

// POST /api/verify/send: texts a code to the phone number.
router.post("/send", verifyLimiter, async (req, res) => {
  const phone = toE164(req.body.phone ?? "");
  if (phone.length < 11) return res.status(400).json({ error: "Please enter a valid phone number." });
  try {
    await sendCode(phone);
    res.json({ ok: true });
  } catch {
    res.status(502).json({ error: "We could not send the text message. Please check the number or call us." });
  }
});

// POST /api/verify/check: checks the code and, if correct, returns the signed receipt.
router.post("/check", async (req, res) => {
  const phone = toE164(req.body.phone ?? "");
  const ok = await checkCode(phone, String(req.body.code ?? "").trim()).catch(() => false);
  if (!ok) return res.status(400).json({ error: "That code is not right. Please try again." });
  res.json({ token: makeToken(phone) });
});

export default router;