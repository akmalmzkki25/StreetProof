"use client";

import { Alert, AlertDescription } from "@streetproof/ui/components/alert";
import { Button } from "@streetproof/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@streetproof/ui/components/field";
import { Input } from "@streetproof/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@streetproof/ui/components/select";
import { Textarea } from "@streetproof/ui/components/textarea";
import { Link } from "@/components/locale-link";
import { startTransition, useActionState, useRef, useState } from "react";

import { submitReportAction, type ReportFormState } from "../actions";
import { useI18n } from "@/lib/i18n/client";
import { MAX_PHOTOS } from "@/lib/photos";
import { VoiceNoteButton } from "./voice-note-button";

const initialState: ReportFormState = { status: "idle", error: null };

export function ReportForm({
  intakeCode,
  locations,
  canRecordVoice,
}: {
  intakeCode: string;
  locations: { id: string; name: string }[];
  canRecordVoice: boolean;
}) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    submitReportAction.bind(null, intakeCode),
    initialState,
  );
  const [location, setLocation] = useState<string | null>(null);
  const submissionKey = useRef<string | null>(null);
  const description = useRef<HTMLTextAreaElement>(null);

  // Added to what's there, and left editable, because a transcript can be wrong.
  function addTranscript(text: string) {
    const field = description.current;
    if (!field) return;
    field.value = field.value ? `${field.value} ${text}` : text;
    field.focus();
  }

  const locationItems = [
    ...locations.map((item) => ({ value: item.id, label: item.name })),
    { value: "other", label: t("Somewhere else") },
  ];

  // Submitted by hand: React resets an uncontrolled form after an action, which
  // would drop the photos when a retry is needed. The key survives retries so a
  // lost response can't create a second ticket.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submissionKey.current ??= crypto.randomUUID();
    const data = new FormData(event.currentTarget);
    data.set("submissionKey", submissionKey.current);
    data.set("location", location ?? "");
    startTransition(() => formAction(data));
  }

  if (state.status === "submitted") {
    return (
      <section aria-labelledby="report-sent" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 id="report-sent" className="text-xl">
            {t("Report sent")}
          </h2>
          <p className="type-caption text-muted-foreground">
            {t(
              "Your reference is {reference}. The building team will review it.",
              {
                reference: state.reference,
              },
            )}
          </p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={state.statusPath} />}
        >
          {t("View status")}
        </Button>
        <p className="type-caption text-muted-foreground">
          {t(
            "Open it now, because this link isn't shown again. After that, the status page stays available on this device at /status.",
          )}
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="location">
            {t("Where is the damage?")}
          </FieldLabel>
          <Select
            items={locationItems}
            value={location}
            onValueChange={(value) => setLocation(value)}
          >
            <SelectTrigger id="location" className="w-full max-sm:h-11!">
              <SelectValue placeholder={t("Choose a location")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {locationItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {location === "other" ? (
          <Field>
            <FieldLabel htmlFor="locationText">
              {t("Describe the location")}
            </FieldLabel>
            <Input
              id="locationText"
              name="locationText"
              maxLength={200}
              className="max-sm:h-11"
              placeholder={t("Floor 2, west corridor")}
            />
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="description">
            {t("What did you see?")}
          </FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            ref={description}
            required
            placeholder={t("Water dripping from the ceiling near the lift")}
          />
          {canRecordVoice ? (
            <VoiceNoteButton onTranscript={addTranscript} />
          ) : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="photos">{t("Photos")}</FieldLabel>
          <Input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            className="max-sm:h-11 max-sm:pt-2.5"
          />
          <FieldDescription>
            {t(
              "Up to {count} photos, JPEG, PNG or WebP, 10 MB each. Avoid showing people's faces.",
              { count: MAX_PHOTOS },
            )}
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="reporterEmail">
            {t("Email (optional)")}
          </FieldLabel>
          <Input
            id="reporterEmail"
            name="reporterEmail"
            type="email"
            autoComplete="email"
            maxLength={200}
            className="max-sm:h-11"
          />
          <FieldDescription>
            {t(
              "We only use it to tell you when the status changes, and to send a new status link if you lose yours.",
            )}
          </FieldDescription>
        </Field>
      </FieldGroup>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{t(state.error)}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? t("Sending report…") : t("Submit report")}
      </Button>
    </form>
  );
}
