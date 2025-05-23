const express = require("express");
const cors = require("cors");
const winston = require("winston");

const app = express();
const port = process.env.PORT || 1337;

// Configure logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.post("/send", (req, res) => {
  const { type, recipient, message } = req.body;
  const random = Math.random() * 100;

  logger.info("Received notification request", {
    type,
    recipient,
    random,
    timestamp: new Date().toISOString(),
  });

  if (random <= 30) {
    // 30% chance of rate limit
    logger.warn("Rate limit exceeded", { random });
    return res.status(429).json({
      error: "Too Many Requests",
      message: "Rate limit exceeded",
      retryAfter: 30,
    });
  }

  if (random > 30 && random <= 35) {
    // 5% chance of server error
    logger.error("Internal server error occurred", { random });
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong",
      errorId: Date.now().toString(36),
    });
  }

  if (random > 35 && random <= 55) {
    // 20% chance of timeout (5 seconds)
    logger.info("Delayed response initiated", { random });
    setTimeout(() => {
      logger.info("Sending delayed response", { random });
      res.json({
        success: true,
        message: "Delayed response",
        processedAt: new Date().toISOString(),
      });
    }, 5000);
    return;
  }

  // Normal response
  logger.info("Sending successful response", { random });
  res.json({
    success: true,
    message: "Notification processed successfully",
    processedAt: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
});

app.listen(port, "0.0.0.0", () => {
  logger.info(`Mock API running on port ${port}`);
});
