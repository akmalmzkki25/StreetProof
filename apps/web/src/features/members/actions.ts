"use server";

import {
  createMember,
  createTeam,
  getDb,
  retireTeam,
  setMemberActive,
  setMemberPassword,
  updateMemberAccess,
  type MemberOutcome,
} from "@streetproof/db";
import { ROLES } from "@streetproof/domain";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/member";

export type MemberActionState = { error: string | null; isDone: boolean };

const ALL_SITES = "all";

const password = z
  .string()
  .min(8, "Use at least 8 characters for the password.")
  .max(128, "Keep the password under 128 characters.");

const access = {
  roles: z.array(z.enum(ROLES)).min(1, "Choose at least one role."),
  site: z.string().min(1, "Choose a site."),
};

const newMemberFields = z.object({
  name: z.string().trim().min(2, "Enter their name.").max(100),
  email: z.email("Enter a valid email address."),
  password,
  ...access,
});

const accessFields = z.object({ userId: z.string().min(1), ...access });
const activeFields = z.object({
  userId: z.string().min(1),
  isActive: z.enum(["true", "false"]),
});
const passwordFields = z.object({ userId: z.string().min(1), password });
const teamFields = z.object({
  name: z.string().trim().min(2, "Enter the team's name.").max(60),
});

const OUTCOME_MESSAGES: Record<
  Extract<MemberOutcome, { ok: false }>["code"],
  string
> = {
  email_taken: "That email already has an account.",
  unknown_site: "Choose a site from this list.",
  not_found: "This member isn't available.",
  last_admin: "Keep at least one active tenant admin.",
  no_roles: "Choose at least one role.",
};

function finish(outcome: MemberOutcome): MemberActionState {
  if (!outcome.ok) {
    return { error: OUTCOME_MESSAGES[outcome.code], isDone: false };
  }
  revalidatePath("/app/members");
  return { error: null, isDone: true };
}

function invalid(error: z.ZodError): MemberActionState {
  return {
    error: error.issues[0]?.message ?? "Check the form.",
    isDone: false,
  };
}

function siteIdOf(site: string) {
  return site === ALL_SITES ? null : site;
}

export async function addMemberAction(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const member = await requireRole("tenant_admin");
  const fields = newMemberFields.safeParse({
    name: formData.get("name") ?? "",
    email: String(formData.get("email") ?? "").trim(),
    password: formData.get("password") ?? "",
    roles: formData.getAll("roles"),
    site: formData.get("site") ?? "",
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await createMember(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      name: fields.data.name,
      email: fields.data.email,
      passwordHash: await hashPassword(fields.data.password),
      roles: fields.data.roles,
      siteId: siteIdOf(fields.data.site),
    }),
  );
}

export async function updateAccessAction(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const member = await requireRole("tenant_admin");
  const fields = accessFields.safeParse({
    userId: formData.get("userId") ?? "",
    roles: formData.getAll("roles"),
    site: formData.get("site") ?? "",
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await updateMemberAccess(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      userId: fields.data.userId,
      roles: fields.data.roles,
      siteId: siteIdOf(fields.data.site),
    }),
  );
}

export async function setActiveAction(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const member = await requireRole("tenant_admin");
  const fields = activeFields.safeParse({
    userId: formData.get("userId") ?? "",
    isActive: formData.get("isActive"),
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await setMemberActive(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      userId: fields.data.userId,
      isActive: fields.data.isActive === "true",
    }),
  );
}

export async function setPasswordAction(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const member = await requireRole("tenant_admin");
  const fields = passwordFields.safeParse({
    userId: formData.get("userId") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!fields.success) return invalid(fields.error);

  return finish(
    await setMemberPassword(getDb(), {
      tenantId: member.tenantId,
      actorId: member.userId,
      userId: fields.data.userId,
      passwordHash: await hashPassword(fields.data.password),
    }),
  );
}

export async function addTeamAction(
  _previous: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const member = await requireRole("tenant_admin");
  const fields = teamFields.safeParse({ name: formData.get("name") ?? "" });
  if (!fields.success) return invalid(fields.error);

  await createTeam(getDb(), {
    tenantId: member.tenantId,
    actorId: member.userId,
    name: fields.data.name,
  });
  revalidatePath("/app/members");
  return { error: null, isDone: true };
}

export async function retireTeamAction(formData: FormData) {
  const member = await requireRole("tenant_admin");
  const teamId = z.uuid().safeParse(formData.get("teamId"));
  if (!teamId.success) return;

  await retireTeam(getDb(), {
    tenantId: member.tenantId,
    actorId: member.userId,
    teamId: teamId.data,
  });
  revalidatePath("/app/members");
}
