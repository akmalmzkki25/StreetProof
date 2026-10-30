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
import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";

import { submitReportAction, type ReportFormState } from "../actions";
import { MAX_PHOTOS } from "@/lib/photos";

const initialState: ReportFormState = { status: "idle", error: null };

export function ReportForm({
  intakeCode,
  locations,
}: {
  intakeCode: string;
  locations: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    submitReportAction.bind(null, intakeCode),
    initialState,
  );
  const [location, setLocation] = useState<string | null>(null);
  const submissionKey = useRef<string | null>(null);

  const locationItems = [
    ...locations.map((item) => ({ value: item.id, label: item.name })),
    { value: "other", label: "Somewhere else" },
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
            Report sent
          </h2>
          <p className="text-sm text-muted-foreground">
            Your reference is{" "}
            <span className="font-mono text-foreground">{state.reference}</span>
            . The building team will review it.
          </p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={state.statusPath} />}
        >
          View status
        </Button>
        <p className="text-sm text-muted-foreground">
          Open it now, because this link isn&apos;t shown again. After that, the
          status page stays available on this device at /status.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="location">Where is the damage?</FieldLabel>
          <Select
            items={locationItems}
            value={location}
            onValueChange={(value) => setLocation(value)}
          >
            <SelectTrigger id="location" className="w-full">
              <SelectValue placeholder="Choose a location" />
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
              Describe the location
            </FieldLabel>
            <Input
              id="locationText"
              name="locationText"
              maxLength={200}
              placeholder="Floor 2, west corridor"
            />
          </Field>
        ) : null}

        <Field>
          <FieldLabel htmlFor="description">What did you see?</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            required
            placeholder="Water dripping from the ceiling near the lift"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="photos">Photos</FieldLabel>
          <Input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
          />
          <FieldDescription>
            Up to {MAX_PHOTOS} photos, JPEG, PNG or WebP, 10 MB each. Avoid
            showing people&apos;s faces.
          </FieldDescription>
        </Field>
      </FieldGroup>

      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Sending report…" : "Submit report"}
      </Button>
    </form>
  );
}
