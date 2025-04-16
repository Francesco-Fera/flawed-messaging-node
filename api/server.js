import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import notificationRoutes from "./src/routes/notifications.js";
const app = express();
app.use(express.json());
app.use("/api/notifications", notificationRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

let sockets = [];

wss.on("connection", (ws) => {
  console.log("📡 Client connected via WebSocket");
  sockets.push(ws);

  ws.on("close", () => {
    sockets = sockets.filter((s) => s !== ws);
  });
});

export const broadcastNotification = (data) => {
  console.log("server funct", data);
  sockets.forEach((ws) => {
    if (ws.readyState === 1) ws.send(JSON.stringify(data));
  });
};

server.listen(3000, () => {
  console.log("🚀 Notification API + WebSocket server running on port 3000");
});
