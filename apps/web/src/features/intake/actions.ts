"use server";

import {
  errorFields,
  findIntakeSite,
  getDb,
  hasIntakeSubmission,
  logEvent,
  reportReference,
  submitReport,
  type ReportPhoto,
} from "@streetproof/db";
import { createMailer, receiptMail } from "@streetproof/db/mail";
import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";

import { readPhotos, storePhotos } from "@/lib/photo-upload";
import { createRateLimiter } from "@/lib/rate-limit";

export type ReportFormState =
  | { status: "idle" | "error"; error: string | null }
  | {
      status: "submitted";
      error: null;
      reference: string;
      statusPath: string;
    };

const OTHER_LOCATION = "other";

const reportFields = z.object({
  submissionKey: z.uuid(),
  location: z.string().min(1, "Choose where the damage is."),
  locationText: z.string().trim().max(200),
  description: z
    .string()
    .trim()
    .min(5, "Describe the damage in a few words.")
    .max(2000, "Keep the description under 2,000 characters."),
  reporterEmail: z.union([
    z.literal(""),
    z.email("Check the email address, or leave it empty."),
  ]),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const isSubmissionAllowed = createRateLimiter({
  limit: 20,
  windowMs: 10 * 60 * 1000,
});

function failure(error: string): ReportFormState {
  return { status: "error", error };
}

// After the response: a slow or failing mail server must never fail a report.
async function sendReceipt(to: string, reportId: string, token: string) {
  const sendMail = createMailer();
  if (!sendMail) return;
  try {
    await sendMail(
      receiptMail({
        to,
        reference: reportReference(reportId),
        token,
        appUrl: process.env.APP_URL ?? "",
      }),
    );
  } catch (error) {
    logEvent("error", "Receipt email failed", errorFields(error));
  }
}

export async function submitReportAction(
  intakeCode: string,
  _previous: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!isSubmissionAllowed(`${clientAddress}:${intakeCode}`)) {
    return failure("Too many reports from this device. Try again in a while.");
  }

  const db = getDb();
  const site = await findIntakeSite(db, intakeCode);
  if (!site) return failure("This report link isn't available.");

  const fields = reportFields.safeParse({
    submissionKey: formData.get("submissionKey"),
    location: formData.get("location") ?? "",
    locationText: formData.get("locationText") ?? "",
    description: formData.get("description") ?? "",
    reporterEmail: String(formData.get("reporterEmail") ?? "").trim(),
    latitude: formData.get("latitude") ?? undefined,
    longitude: formData.get("longitude") ?? undefined,
  });
  if (!fields.success) {
    return failure(fields.error.issues[0]?.message ?? "Check the form.");
  }
  const { submissionKey, location, locationText, description, reporterEmail } =
    fields.data;
  const point =
    fields.data.latitude !== undefined && fields.data.longitude !== undefined
      ? { latitude: fields.data.latitude, longitude: fields.data.longitude }
      : null;

  const isOtherLocation = location === OTHER_LOCATION;
  if (isOtherLocation && locationText.length === 0) {
    return failure("Describe where the damage is.");
  }
  const locationId = isOtherLocation ? null : location;
  if (locationId && !site.locations.some((item) => item.id === locationId)) {
    return failure("Choose where the damage is.");
  }

  const read = await readPhotos(formData);
  if (!read.ok) return failure(read.error);

  const requestDigest = createHash("sha256")
    .update(
      JSON.stringify({
        location,
        locationText,
        description,
        reporterEmail,
        point,
        photos: read.photos.map((photo) => photo.sha256),
      }),
    )
    .digest("hex");

  const reportId = randomUUID();
  let photos: ReportPhoto[] = [];

  // A retry after a lost response already has its photos stored.
  if (!(await hasIntakeSubmission(db, site.tenantId, submissionKey))) {
    try {
      photos = await storePhotos(
        read.photos,
        `tenants/${site.tenantId}/reports/${reportId}`,
      );
    } catch (error) {
      console.error("Report photo upload failed", error);
      return failure("We couldn't save your photos. Please try again.");
    }
  }

  const outcome = await submitReport(db, {
    tenantId: site.tenantId,
    siteId: site.id,
    reportId,
    locationId,
    locationText: isOtherLocation ? locationText : null,
    description,
    reporterEmail: reporterEmail || null,
    point,
    photos,
    idempotencyKey: submissionKey,
    requestDigest,
  });

  if (!outcome.ok) {
    return failure(
      outcome.code === "idempotency_conflict"
        ? "This report was already sent with different details. Reload the page to send a new one."
        : "This report was already sent. Ask the building team for its status.",
    );
  }

  if (reporterEmail) {
    const { reportId, reporterToken } = outcome;
    after(() => sendReceipt(reporterEmail, reportId, reporterToken));
  }

  return {
    status: "submitted",
    error: null,
    reference: reportReference(outcome.reportId),
    statusPath: `/status#t=${outcome.reporterToken}`,
  };
}
