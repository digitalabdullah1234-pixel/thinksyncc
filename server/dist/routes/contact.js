import { Router } from "express";
const router = Router();
router.post("/", async (req, res) => {
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
//# sourceMappingURL=contact.js.map