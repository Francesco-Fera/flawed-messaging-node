import express from "express";

const app = express();
app.use(express.json());

app.use("/api/notifications", notificationRoutes);

app.listen(3000, () => {
  console.log("Notification Api running on port 3000");
});
