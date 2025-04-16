import Redis from "ioredis";
import axios from "axios";
import pRetry from "p-retry";

const REDIS_URI = process.env.REDIS_URI;

const redis = new Redis(REDIS_URI);

const processNotification = async (raw) => {
  // to implement
  const data = JSON.parse(raw);
  console.log("Processing: ", data);
};

const run = async () => {
  while (true) {
    const data = await redis.brpop("notificationsQueue", 0);
    if (data && data[1]) await processNotification(data[1]);
  }
};

run();
