import { z } from "zod";
import express from "express";
import Redis from "ioredis";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import Notification from "../models/notification.js";
import { broadcastNotification } from "../../server.js";

const MONGODB_URI = process.env.MONGODB_URI;
const REDIS_URI = process.env.REDIS_URI;

const redis = new Redis(REDIS_URI);
mongoose.connect(MONGODB_URI);

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

router.get("/", async (req, res) => {
  try {
    const items = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/broadcast", (req, res) => {
  console.log("router:", req.body);
  broadcastNotification(req.body);
  res.sendStatus(204);
});

export default router;
