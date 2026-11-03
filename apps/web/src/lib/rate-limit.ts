import "server-only";

import { getPool } from "@streetproof/db";
import {
  RateLimiterMemory,
  RateLimiterPostgres,
  RateLimiterRes,
  type RateLimiterAbstract,
} from "rate-limiter-flexible";

export type RateLimitOptions = {
  // Unique per limiter, so two limits on the same key don't share a count.
  name: string;
  limit: number;
  windowMs: number;
};

// Counts live in Postgres, so every web instance shares them. If the database
// can't answer, the limiter falls back to this instance's memory rather than
// letting everything through.
export function createRateLimiter(
  options: RateLimitOptions,
  // Tests pass memory only.
  storeFor: (
    options: RateLimitOptions,
    fallback: RateLimiterMemory,
  ) => RateLimiterAbstract = postgresStore,
) {
  const points = options.limit;
  const duration = Math.max(1, Math.round(options.windowMs / 1000));
  let limiter: RateLimiterAbstract | undefined;

  return async function isAllowed(key: string) {
    limiter ??= storeFor(
      options,
      new RateLimiterMemory({ keyPrefix: options.name, points, duration }),
    );
    try {
      await limiter.consume(key);
      return true;
    } catch (rejection) {
      if (rejection instanceof RateLimiterRes) return false;
      throw rejection;
    }
  };
}

function postgresStore(options: RateLimitOptions, fallback: RateLimiterMemory) {
  return new RateLimiterPostgres({
    storeClient: getPool(),
    storeType: "pool",
    tableName: "rate_limits",
    tableCreated: true,
    keyPrefix: options.name,
    points: options.limit,
    duration: Math.max(1, Math.round(options.windowMs / 1000)),
    insuranceLimiter: fallback,
  });
}

export function memoryStore(
  _options: RateLimitOptions,
  fallback: RateLimiterMemory,
) {
  return fallback;
}
