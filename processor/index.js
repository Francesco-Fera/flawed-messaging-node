import Redis from "ioredis";
import axios from "axios";
import pRetry from "p-retry";
import Notification from "./src/models/notification.js";

const REDIS_URI = process.env.REDIS_URI;

const redis = new Redis(REDIS_URI);

const processNotification = async (raw) => {
  const data = JSON.parse(raw);
  console.log("Processing: ", data);

  const sendNotification = async () => {
    await axios.post("http://localhost:1337/send", data, { timeout: 3000 });
  };

  try {
    await pRetry(sendNotification, {
      retries: 5,
      onFailedAttempt: async (error) => {
        console.log(
          `Attempt number ${error.attemptNumber} failed. ${error.retriesLeft} retries left`
        );
        await Notification.findOneAndUpdate(
          { id: data.id },
          {
            $set: { status: "retrying", lastError: error.message },
            $inc: { attempts: 1 },
          },
          { upsert: true }
        );
      },
    });
    const savedNot = await Notification.findOneAndUpdate(
      { id: data.id },
      { $set: { status: "sent" } },
      { upsert: true }
    );
    console.log("saved: ", savedNot);
  } catch (error) {
    console.error("faild to send notification: ", error.message);
    await Notification.findOneAndUpdate(
      { id: data.id },
      { $set: { status: "failed", lastError: error.message } }
    );
  }
};

const run = async () => {
  while (true) {
    const data = await redis.brpop("notificationsQueue", 0);
    if (data && data[1]) await processNotification(data[1]);
  }
};

run();
