import mongoose from "mongoose";

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      id: String,
      type: String,
      to: String,
      message: String,
      status: String,
      attempts: Number,
      lastError: String,
    },
    { timestamps: true }
  )
);

export default Notification;
