import "./load-root-env";
import { hashPassword } from "better-auth/crypto";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { createDb } from "../src/client";
import {
  parseLocationNames,
  parseRoles,
  setupProblem,
  setupTenant,
} from "../src/setup";

// Creates a new organisation's first site, its locations and the admin who adds
// everyone else. Safe on a database with other tenants: it only ever adds rows.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set in the root .env.");

const isSynthetic = process.argv.includes("--synthetic");

// Lines are read from one queue, so piped answers aren't lost between questions.
// While a password is typed nothing is echoed, so it doesn't stay on screen.
let isEchoing = true;
const prompt = createInterface({
  input: stdin,
  output: new Writable({
    write(chunk, encoding, done) {
      if (isEchoing) stdout.write(chunk, encoding);
      done();
    },
  }),
  terminal: stdin.isTTY,
});
const lines = prompt[Symbol.asyncIterator]();

async function nextLine() {
  const line = await lines.next();
  return line.done ? "" : String(line.value);
}

async function ask(question: string, fallback = "") {
  const hint = fallback ? ` [${fallback}]` : "";
  stdout.write(`${question}${hint}: `);
  const answer = (await nextLine()).trim();
  if (!stdin.isTTY) stdout.write("\n");
  return answer || fallback;
}

async function askHidden(question: string) {
  stdout.write(`${question}: `);
  isEchoing = false;
  const answer = await nextLine();
  isEchoing = true;
  stdout.write("\n");
  return answer;
}

console.log(
  isSynthetic
    ? "New synthetic tenant. Its figures are labelled as test data in the app."
    : "New tenant. Once it exists, pnpm db:seed refuses to wipe this database.",
);

const tenantName = await ask("Organisation name");
const siteName = await ask("First building (site) name");
const intakeCode = await ask(
  "Report link code, used in /report/<code> and the Telegram link",
);
const timezone = await ask(
  "Building time zone (Asia/Jakarta for WIB, Asia/Makassar for WITA, Asia/Jayapura for WIT)",
  "Asia/Jakarta",
);
const locationNames = parseLocationNames(
  await ask("Locations in that building, comma separated"),
);
const adminName = await ask("Admin's name");
const adminEmail = (await ask("Admin's email")).toLowerCase();
const roles = parseRoles(
  await ask(
    "Admin's roles, comma separated (tenant_admin, operator, supervisor, technician)",
    "tenant_admin",
  ),
);
if (!roles) {
  console.error("Use only tenant_admin, operator, supervisor or technician.");
  process.exit(1);
}

const password = await askHidden(
  "Admin's first password (8 to 128 characters)",
);
const repeated = await askHidden("Type it again");
prompt.close();
if (password !== repeated) {
  console.error("The passwords don't match. Nothing was created.");
  process.exit(1);
}

const input = {
  tenantName,
  siteName,
  intakeCode,
  timezone,
  locationNames,
  adminName,
  adminEmail,
  roles,
  isSynthetic,
};
const problem = setupProblem({ ...input, password });
if (problem) {
  console.error(`${problem} Nothing was created.`);
  process.exit(1);
}

const { db, pool } = createDb(url);
const outcome = await setupTenant(db, {
  ...input,
  passwordHash: await hashPassword(password),
});
await pool.end();

if (!outcome.ok) {
  console.error(
    outcome.code === "email_taken"
      ? "An account with that email already exists. Nothing was created."
      : "Another site already uses that report link code. Nothing was created.",
  );
  process.exit(1);
}

const appUrl = process.env.APP_URL ?? "";
console.log(`
Created "${tenantName}" with "${siteName}" and ${locationNames.length} locations.
Sign in at ${appUrl}/login as ${adminEmail}, then add members at ${appUrl}/app/members.
Reporters use ${appUrl}/report/${intakeCode}`);
