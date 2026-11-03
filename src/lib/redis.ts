import Redis, { RedisOptions } from "ioredis";

declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL || "redis://:redis_password@localhost:6379";

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy(times) {
    // Retry reconnecting with exponential backoff capped at 3 seconds
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
};

function createRedisInstance(): Redis {
  const client = new Redis(redisUrl, redisOptions);

  client.on("error", (err) => {
    // Graceful error logging to avoid crashing Node.js process if Redis is unreachable
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis] Connection error:", err.message);
    }
  });

  return client;
}

export const redis: Redis = globalThis.__redisClient || createRedisInstance();

if (process.env.NODE_ENV !== "production") {
  globalThis.__redisClient = redis;
}

/**
 * Checks if Redis is currently connected and responsive
 */
export async function isRedisConnected(): Promise<boolean> {
  try {
    if (redis.status === "wait") {
      await redis.connect();
    }
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}

export default redis;
