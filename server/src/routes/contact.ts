import { Router, Request, Response } from "express";

interface ContactPayload {
  name?: string;
  contact?: string;
  service?: string;
  message?: string;
}

const router = Router();

router.post("/", async (req: Request<{}, {}, ContactPayload>, res: Response) => {
  const body = req.body;

  const { name, contact, message } = body;

  if (!name?.trim() || !contact?.trim() || !message?.trim()) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields.",
    });
  }

  console.log("[ThinkSync] New project inquiry:", body);

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  // TODO: Store in database

  return res.json({ success: true });
});

export default router;