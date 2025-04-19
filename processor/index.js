import Redis from "ioredis";
import axios from "axios";
import pRetry from "p-retry";
import Notification from "./src/models/notification.js";
import mongoose from "mongoose";

const REDIS_URI = process.env.REDIS_URI;
const MONGODB_URI = process.env.MONGODB_URI;

const redis = new Redis(REDIS_URI);
mongoose.connect(MONGODB_URI);

const processNotification = async (raw) => {
  const data = JSON.parse(raw);
  // console.log("Processing: ", data);

  const sendNotification = async () => {
    await axios.post("http://mock-api:1337/send", data, { timeout: 3000 });
  };

  try {
    await pRetry(sendNotification, {
      retries: 5,
      onFailedAttempt: async (error) => {
        console.log(
          `Attempt number ${error.attemptNumber} failed. ${error.retriesLeft} retries left`
        );
        const updatedNotification = await Notification.findOneAndUpdate(
          { id: data.id },
          {
            $set: { status: "retrying", lastError: error.message },
            $inc: { attempts: 1 },
          },
          { upsert: true }
        );

        // Notify WebSocket server
        await axios.post(
          "http://api:3000/api/notifications/broadcast",
          updatedNotification
        );
      },
    });
    const updatedNotification = await Notification.findOneAndUpdate(
      { id: data.id },
      { $set: { status: "sent" } },
      { upsert: true }
    );
    // Notify WebSocket server
    await axios.post(
      "http://api:3000/api/notifications/broadcast",
      updatedNotification
    );
  } catch (error) {
    console.error("faild to send notification: ", error.message);
    const updatedNotification = await Notification.findOneAndUpdate(
      { id: data.id },
      { $set: { status: "failed", lastError: error.message } }
    );
    // Notify WebSocket server
    await axios.post(
      "http://api:3000/api/notifications/broadcast",
      updatedNotification
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
