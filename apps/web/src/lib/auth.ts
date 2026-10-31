import "server-only";

import {
  findMemberByEmail,
  getDb,
  logEvent,
  recordAudit,
  schema,
} from "@streetproof/db";
import { createMailer, passwordResetMail } from "@streetproof/db/mail";
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
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      revokeSessionsOnPasswordReset: true,
      async sendResetPassword({ user, url }) {
        const sendMail = createMailer();
        if (sendMail) {
          await sendMail(passwordResetMail({ to: user.email, url }));
          return;
        }
        // Without a mail server a tenant admin sets the password instead.
        logEvent("warn", "Password reset asked for, but email isn't set up");
        if (process.env.NODE_ENV === "development") {
          console.info(`Password reset link: ${url}`);
        }
      },
      async onPasswordReset({ user }) {
        const member = await findMemberByEmail(getDb(), user.email);
        if (!member) return;
        await recordAudit(getDb(), {
          tenantId: member.tenantId,
          actorId: user.id,
          action: "auth.password_reset",
          targetType: "user",
          targetId: user.id,
        });
      },
    },
    plugins: [nextCookies()],
  });
}

let shared: ReturnType<typeof createAuth> | undefined;

// Created on first request so `next build` never needs a database connection.
export function getAuth() {
  shared ??= createAuth();
  return shared;
}
