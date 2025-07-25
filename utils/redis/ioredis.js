import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  enableOfflineQueue: false,
  reconnectOnError: false, 
});

redis.on("connect", () => console.log(" Redis Connected"));
redis.on("error", (err) => console.error(" Redis Error", err));

export default redis;