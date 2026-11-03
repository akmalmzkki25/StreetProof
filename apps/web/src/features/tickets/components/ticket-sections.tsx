import type { TicketDetail } from "@streetproof/db";
import { canManageDuplicates, isOverdue } from "@streetproof/domain";
import { Badge } from "@streetproof/ui/components/badge";
import { Link } from "@/components/locale-link";

import { Panel } from "@/components/panel";
import type { MapPin } from "@/features/places/components/map-canvas";
import { PlaceMap } from "@/features/places/components/place-map";
import { formatDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { Member } from "@/lib/member";
import { getStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";

import { categoryLabel, PRIORITY_LABELS, STATUS_LABELS } from "../labels";
import { UnlinkDuplicateForm } from "./duplicate-forms";
import { NoteForm } from "./note-form";
import { PhotoLightbox } from "./photo-lightbox";
import { ProofCheckPanel } from "./proof-check-panel";
import { ReissueLinkForm } from "./reissue-link-form";

// Set by the worker rather than a person.
const WORKER_EVENT_TYPES = ["ai_draft_ready", "ai_proof_check_ready"];

type StoredPhoto = { id: string; objectKey: string };

async function PhotoGrid({
  photos,
  label,
  columns = "grid-cols-2 sm:grid-cols-3",
}: {
  photos: StoredPhoto[];
  label: string;
  columns?: string;
}) {
  if (photos.length === 0) return null;

  const { t } = await getI18n();
  const storage = getStorage();
  const signed = await Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      url: await storage.signedReadUrl(photo.objectKey),
    })),
  );

  return (
    <PhotoLightbox
      className={columns}
      photos={signed.map((photo, index) => ({
        ...photo,
        alt: `${t(label)} ${index + 1}`,
      }))}
    />
  );
}

const ATTEMPT_LABELS = {
  pending: "Awaiting verification",
  accepted: "Verified",
  rejected: "Proof rejected",
} as const;

const ATTEMPT_VARIANTS = {
  pending: "outline",
  accepted: "brand",
  rejected: "destructive",
} as const;

async function BeforeAfter({
  before,
  after,
}: {
  before: StoredPhoto[];
  after: StoredPhoto[];
}) {
  const { t } = await getI18n();
  // Two columns even on a phone: seeing both at once is the point.
  const columns = "grid-cols-1";
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="type-caption text-muted-foreground">
          {t("Before, from the report")}
        </h3>
        <PhotoGrid photos={before} label="Before photo" columns={columns} />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="type-caption text-muted-foreground">
          {t("After, from the technician")}
        </h3>
        <PhotoGrid photos={after} label="Proof photo" columns={columns} />
      </div>
    </div>
  );
}

export async function Attempts({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (ticket.attempts.length === 0) return null;
  const { t, locale } = await getI18n();
  const reportPhotos = ticket.reports.flatMap((report) => report.photos);
  const isSupervisor = member.roles.includes("supervisor");

  return (
    <section aria-labelledby="attempts" className="flex flex-col gap-4">
      <h2 id="attempts" className="type-title">
        {t("Completion proof")}
      </h2>
      {ticket.attempts.map((attempt) => (
        <article
          key={attempt.id}
          className="flex flex-col gap-3 rounded-4xl bg-card p-6 shadow-card"
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant={ATTEMPT_VARIANTS[attempt.status]}>
              {t(ATTEMPT_LABELS[attempt.status])}
            </Badge>
            {attempt.exceptionReason ? (
              <Badge variant="outline">{t("Exception requested")}</Badge>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap">{attempt.note}</p>
          <p className="type-caption flex flex-wrap gap-x-2 text-muted-foreground">
            <span className="text-foreground">{attempt.submitterName}</span>
            <span>
              {formatDateTime(attempt.submittedAt, locale, ticket.timeZone)}
            </span>
          </p>
          {attempt.exceptionReason ? (
            <p className="whitespace-pre-wrap">
              <span className="text-muted-foreground">
                {t("Why it can't all be confirmed:")}{" "}
              </span>
              {attempt.exceptionReason}
            </p>
          ) : null}
          {attempt.checklist.length > 0 ? (
            <ul className="flex flex-col gap-1 type-caption">
              {attempt.checklist.map((item) => (
                <li
                  key={item.id}
                  className={item.checked ? "" : "text-destructive"}
                >
                  {item.checked ? t("Confirmed") : t("Not confirmed")}:{" "}
                  {t(item.label)}
                </li>
              ))}
            </ul>
          ) : null}
          {attempt.photos.length === 0 ? (
            <p className="type-caption text-muted-foreground">
              {t("No photo was added.")}
            </p>
          ) : null}
          {attempt.status === "pending" &&
          attempt.photos.length > 0 &&
          reportPhotos.length > 0 ? (
            <BeforeAfter before={reportPhotos} after={attempt.photos} />
          ) : (
            <PhotoGrid photos={attempt.photos} label="Proof photo" />
          )}
          {isSupervisor ? <ProofCheckPanel attempt={attempt} /> : null}
          {attempt.decisionReason ? (
            <p>
              <span className="text-muted-foreground">
                {attempt.verifierName}:{" "}
              </span>
              {attempt.decisionReason}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

export async function Reports({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  const { t, locale } = await getI18n();
  const canReissueLink = canManageDuplicates(member.roles);
  return (
    <section aria-labelledby="reports" className="flex flex-col gap-4">
      <h2 id="reports" className="type-title">
        {t("Reporter-provided")}
      </h2>
      {ticket.reports.map((report) => (
        <article
          key={report.id}
          className={cn(
            "grid gap-6 rounded-4xl bg-card p-6 shadow-card",
            report.photos.length > 0 && "@2xl:grid-cols-[minmax(0,1fr)_14rem]",
          )}
        >
          <div className="flex min-w-0 flex-col gap-3">
            <p className="whitespace-pre-wrap">{report.description}</p>
            <p className="type-caption flex flex-wrap gap-x-2 text-muted-foreground">
              <span className="text-foreground">
                {report.locationName ?? report.locationText}
              </span>
              <span>
                {formatDateTime(report.createdAt, locale, ticket.timeZone)}
              </span>
            </p>
            {canReissueLink ? (
              <ReissueLinkForm ticketId={ticket.id} reportId={report.id} />
            ) : null}
          </div>
          <PhotoGrid
            photos={report.photos}
            label="Report photo"
            columns={report.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}
          />
        </article>
      ))}
    </section>
  );
}

export async function LinkedReports({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (ticket.linkedDuplicates.length === 0) return null;
  const { t, locale } = await getI18n();
  const canOpenSource = canManageDuplicates(member.roles);

  return (
    <section aria-labelledby="linked" className="flex flex-col gap-4">
      <h2 id="linked" className="type-title">
        {t("Linked reports")}
      </h2>
      {ticket.linkedDuplicates.map((link) =>
        link.reports.map((report) => (
          <article
            key={report.id}
            className={cn(
              "grid gap-6 rounded-4xl bg-card p-6 shadow-card",
              report.photos.length > 0 &&
                "@2xl:grid-cols-[minmax(0,1fr)_14rem]",
            )}
          >
            <div className="flex min-w-0 flex-col gap-3">
              <p className="whitespace-pre-wrap">{report.description}</p>
              <p className="type-caption flex flex-wrap gap-x-2 text-muted-foreground">
                <span className="text-foreground">
                  {report.locationName ?? report.locationText}
                </span>
                <span>
                  {formatDateTime(report.createdAt, locale, ticket.timeZone)}
                </span>
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("Linked because:")}{" "}
                </span>
                {link.reason}
              </p>
              {canOpenSource ? (
                <Link
                  href={`/app/tickets/${link.ticketId}`}
                  className="self-start text-brand-text underline underline-offset-4"
                >
                  {t("Open this report")}
                </Link>
              ) : null}
            </div>
            <PhotoGrid
              photos={report.photos}
              label="Linked report photo"
              columns={report.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}
            />
          </article>
        )),
      )}
    </section>
  );
}

export async function DuplicateOf({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (!ticket.duplicateOf) return null;
  const { t } = await getI18n();

  return (
    <Panel id="duplicate-of" title="Linked as a duplicate">
      <p className="text-muted-foreground">
        {t(
          "The repair is tracked on the other ticket. This report's reporter follows that ticket's progress.",
        )}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-muted-foreground">{t("Ticket")}</dt>
        <dd>
          <Link
            href={`/app/tickets/${ticket.duplicateOf.ticketId}`}
            className="text-brand-text underline underline-offset-4"
          >
            {ticket.duplicateOf.title}
          </Link>
        </dd>
        <dt className="text-muted-foreground">{t("Status")}</dt>
        <dd>{t(STATUS_LABELS[ticket.duplicateOf.status])}</dd>
        <dt className="text-muted-foreground">{t("Reason")}</dt>
        <dd>{ticket.duplicateOf.reason}</dd>
      </dl>
      {canManageDuplicates(member.roles) ? (
        <UnlinkDuplicateForm ticketId={ticket.id} revision={ticket.revision} />
      ) : null}
    </Panel>
  );
}

// The building in grey and any pin a reporter dropped, so staff can find it.
export async function Where({ ticket }: { ticket: TicketDetail }) {
  const { t } = await getI18n();
  const reportPins: MapPin[] = ticket.reports.flatMap((report) =>
    report.latitude !== null && report.longitude !== null
      ? [
          {
            latitude: report.latitude,
            longitude: report.longitude,
            label: t("Reporter's pin"),
          },
        ]
      : [],
  );
  const sitePin: MapPin[] =
    ticket.siteLatitude !== null && ticket.siteLongitude !== null
      ? [
          {
            latitude: ticket.siteLatitude,
            longitude: ticket.siteLongitude,
            label: ticket.siteName,
            tone: "muted",
          },
        ]
      : [];
  const pins = [...reportPins, ...sitePin];
  if (pins.length === 0) return null;

  return (
    <Panel id="where" title="Where">
      <PlaceMap pins={pins} />
      <p className="type-caption text-muted-foreground">
        {reportPins.length > 0
          ? t("Red is where the reporter put the pin. Grey is the building.")
          : (ticket.siteAddress ?? ticket.siteName)}
      </p>
    </Panel>
  );
}

export async function InternalNotes({ ticket }: { ticket: TicketDetail }) {
  const { t, locale } = await getI18n();
  return (
    <Panel id="internal-notes" title="Internal notes">
      <p className="type-caption text-muted-foreground">
        {t("Your team can read these. The reporter never sees them.")}
      </p>
      {ticket.notes.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {ticket.notes.map((note) => (
            <li key={note.id}>
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="type-caption flex flex-wrap gap-x-2 text-muted-foreground">
                <span className="text-foreground">{note.authorName}</span>
                <span>
                  {formatDateTime(note.createdAt, locale, ticket.timeZone)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : null}
      <NoteForm ticketId={ticket.id} />
    </Panel>
  );
}

export async function Facts({ ticket }: { ticket: TicketDetail }) {
  if (!ticket.category) return null;
  const { t, locale } = await getI18n();
  const isOverdueNow = isOverdue(ticket, new Date());
  const isPriorityHigh =
    ticket.priority === "urgent" || ticket.priority === "high";
  const facts = [
    { label: t("Category"), value: t(categoryLabel(ticket.category) ?? "") },
    {
      label: t("Priority"),
      value: ticket.priority
        ? t(PRIORITY_LABELS[ticket.priority])
        : t("Not set"),
      isAlert: isPriorityHigh,
    },
    {
      label: t("Location"),
      value: ticket.locationName ?? t("As the reporter described"),
    },
    { label: t("Technician"), value: ticket.assigneeName },
    { label: t("Team"), value: ticket.teamName },
    {
      label: t("Due by"),
      value: ticket.dueAt
        ? `${formatDateTime(ticket.dueAt, locale, ticket.timeZone)}${isOverdueNow ? ` ${t("(overdue)")}` : ""}`
        : null,
      isAlert: isOverdueNow,
      isMono: true,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y py-4 @2xl:grid-cols-3 @5xl:grid-cols-6">
      {facts.map((fact) =>
        fact.value ? (
          <div key={fact.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="type-caption text-muted-foreground">{fact.label}</dt>
            <dd
              className={cn(
                "font-medium",
                fact.isMono && "font-mono text-sm",
                fact.isAlert && "text-destructive",
              )}
            >
              {fact.value}
            </dd>
          </div>
        ) : null,
      )}
    </dl>
  );
}

function eventLabel(event: TicketDetail["events"][number]) {
  if (event.type === "ai_draft_ready") return "AI suggestion ready";
  if (event.type === "ai_draft_retried") return "AI suggestion requested again";
  if (event.type === "ai_proof_check_ready") return "AI comparison ready";
  if (event.type === "note_added") return "Internal note added";
  if (event.type === "clarification_answered") return "Reporter answered";
  if (
    event.fromStatus === "needs_clarification" &&
    event.toStatus === "submitted"
  ) {
    return "Back to triage";
  }
  if (event.type === "duplicate_unlinked") return "Duplicate link removed";
  if (event.type === "duplicate_linked") {
    return event.payload.role === "target"
      ? "Duplicate report linked"
      : "Linked as a duplicate";
  }
  return event.toStatus ? STATUS_LABELS[event.toStatus] : event.type;
}

export async function Timeline({ ticket }: { ticket: TicketDetail }) {
  const { t, locale } = await getI18n();
  return (
    <section aria-labelledby="timeline" className="flex flex-col gap-5">
      <h2 id="timeline" className="type-title">
        {t("History")}
      </h2>
      <ol className="flex flex-col">
        {ticket.events.map((event, index) => (
          <li
            key={event.id}
            className={cn(
              "relative pb-6 pl-8 last:pb-0",
              index < ticket.events.length - 1 &&
                "after:absolute after:top-[22px] after:-bottom-[3px] after:left-[5px] after:w-px after:bg-rule",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-[7px] left-0 size-[11px] rounded-full border-2",
                index === ticket.events.length - 1
                  ? "border-brand bg-brand"
                  : "border-faint-foreground bg-background",
              )}
            />
            <p>{t(eventLabel(event))}</p>
            <p className="type-caption flex flex-wrap gap-x-2 text-muted-foreground">
              <span>
                {WORKER_EVENT_TYPES.includes(event.type)
                  ? t("Worker")
                  : (event.actorName ?? t("Reporter"))}
              </span>
              <span>
                {formatDateTime(event.createdAt, locale, ticket.timeZone)}
              </span>
            </p>
            {typeof event.payload.reason === "string" ? (
              <p className="mt-0.5 type-caption text-muted-foreground">
                {event.payload.reason}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
