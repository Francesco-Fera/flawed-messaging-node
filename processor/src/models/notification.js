import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI);

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema({
    id: String,
    type: String,
    to: String,
    message: String,
    status: String,
    attempts: Number,
    lastError: String,
  })
);

export default Notification;
