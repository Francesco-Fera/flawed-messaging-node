import { z } from "zod";
import express from "express";
import Redis from "ioredis";
import { nanoid } from "nanoid";

const REDIS_URI = process.env.REDIS_URI;

const router = express.Router();
const redis = new Redis(REDIS_URI);

router.post("/", async (req, redis) => {
  try {
    const data = req.body;
    const id = nanoid();
    console.log(data, id);
    res.status(202).json({ status: "queued", id });

    //await redis.lpush("notificationsQueue", JSON.stringify({ id, ...data }));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
