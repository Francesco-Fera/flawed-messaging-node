import { z } from "zod";
import express from "express";
import Redis from "ioredis";

const REDIS_URI = process.env.REDIS_URI;
const router = express.Router();
const redis = new Redis();
