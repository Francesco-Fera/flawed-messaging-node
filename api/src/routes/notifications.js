import { z } from "zod";
import express from "express";
import Redis from "ioredis";
import { nanoid } from "nanoid";

const REDIS_URI = process.env.REDIS_URI;
const redis = new Redis(REDIS_URI);

const NotificationSchema = z.object({
  type: z.enum(["email", "sms"]),
  to: z.string().min(1),
  message: z.string().min(1),
});

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const data = NotificationSchema.parse(req.body);
    const id = nanoid();
    console.log(data, id);

    await redis.lpush("notificationsQueue", JSON.stringify({ id, ...data }));
    res.status(202).json({ status: "queued", id });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
