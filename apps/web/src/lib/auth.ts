import "server-only";

import { getDb, schema } from "@streetproof/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

function createAuth() {
  return betterAuth({
    appName: "StreetProof",
    baseURL: process.env.APP_URL,
    secret: process.env.AUTH_SECRET,
    database: drizzleAdapter(getDb(), {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    // Accounts are created by a tenant admin or the seed, never by self sign-up.
    emailAndPassword: { enabled: true, disableSignUp: true },
    plugins: [nextCookies()],
  });
}

let shared: ReturnType<typeof createAuth> | undefined;

// Created on first request so `next build` never needs a database connection.
export function getAuth() {
  shared ??= createAuth();
  return shared;
}
