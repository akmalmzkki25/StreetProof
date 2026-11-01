import {
  getDb,
  listLinkCandidates,
  listSiteLocations,
  listTeams,
  listTechnicians,
  type TicketDetail,
} from "@streetproof/db";
import {
  availableTransitions,
  canBeLinkedAsDuplicate,
  canManageDuplicates,
  canVerifyAttempt,
  checklistFor,
} from "@streetproof/domain";

import { Panel } from "@/components/panel";
import { getI18n } from "@/lib/i18n/server";
import type { Member } from "@/lib/member";

import { readDraft } from "./ai-draft-panel";
import {
  RequestClarificationForm,
  ResumeAfterClarificationForm,
} from "./clarification-forms";
import { LinkDuplicateForm } from "./duplicate-forms";
import {
  AssignForm,
  CancelForm,
  CompletionForm,
  DecisionForm,
  ProgressButton,
  ReopenForm,
  TriageForm,
  WaitForm,
} from "./ticket-forms";

export async function LinkAsDuplicate({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  if (
    ticket.duplicateOf ||
    ticket.linkedDuplicates.length > 0 ||
    !canManageDuplicates(member.roles) ||
    !canBeLinkedAsDuplicate(ticket)
  ) {
    return null;
  }

  const candidates = await listLinkCandidates(
    getDb(),
    { tenantId: member.tenantId, siteIds: member.siteIds },
    { id: ticket.id, siteId: ticket.siteId },
  );
  if (candidates.length === 0) return null;

  // The model's pick starts the form when it's still a valid target. A person
  // still has to submit it.
  const suggestion = readDraft(ticket)?.duplicateCandidates.find((candidate) =>
    candidates.some((item) => item.id === candidate.ticketId),
  );

  return (
    <Panel id="link-duplicate" title="Same problem as another ticket?">
      <LinkDuplicateForm
        suggestionKey={suggestion ? "with-suggestion" : "manual"}
        ticketId={ticket.id}
        revision={ticket.revision}
        candidates={candidates.map((item) => ({
          value: item.id,
          // Location first, so a narrow picker clips the title, not the place.
          label: item.location
            ? `${item.location}: ${item.title.slice(0, 70)}`
            : item.title.slice(0, 70),
        }))}
        defaultTargetId={suggestion?.ticketId ?? null}
        defaultReason={(suggestion?.reason ?? "").slice(0, 500)}
      />
    </Panel>
  );
}

export async function NextStep({
  ticket,
  member,
}: {
  ticket: TicketDetail;
  member: Member;
}) {
  const allowed = availableTransitions(
    {
      status: ticket.status,
      revision: ticket.revision,
      currentAssigneeId: ticket.currentAssigneeId,
    },
    { userId: member.userId, roles: member.roles },
  ).map((rule) => rule.to);
  const db = getDb();
  const ref = { ticketId: ticket.id, revision: ticket.revision };

  const draft = readDraft(ticket);
  const canAsk = allowed.includes("needs_clarification");
  const canResume = allowed.includes("submitted");
  const openQuestion = ticket.clarifications.find((item) => !item.closedAt);
  const isAnswerWaiting = Boolean(openQuestion?.answer);
  const isQuestionUnanswered = Boolean(openQuestion) && !openQuestion?.answer;
  const canTriage = allowed.includes("triaged");
  const canAssign = allowed.includes("assigned");
  const canCancel = allowed.includes("cancelled");
  const canAccept = allowed.includes("accepted");
  const canWork = allowed.includes("in_progress");
  const canWait = allowed.includes("waiting_for_parts");
  const canComplete = allowed.includes("completion_submitted");
  const canDecide = allowed.includes("verified_closed");
  const canReopen = allowed.includes("reopened");
  const pendingAttempt = ticket.attempts.find(
    (attempt) => attempt.status === "pending",
  );

  const { t } = await getI18n();

  if (allowed.length === 0) {
    return (
      <p className="type-caption text-muted-foreground">
        {t("No action is needed from you right now.")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {canAccept || canWork ? (
        <Panel id="progress" title="Your next step">
          {canAccept ? (
            <ProgressButton {...ref} to="accepted" label="Accept work" />
          ) : null}
          {canWork ? (
            <ProgressButton
              {...ref}
              to="in_progress"
              label={
                ticket.status === "accepted" ? "Start work" : "Resume work"
              }
            />
          ) : null}
        </Panel>
      ) : null}
      {canTriage ? (
        <Panel id="triage" title="Confirm triage">
          <TriageForm
            suggestionKey={draft ? "with-draft" : "manual"}
            {...ref}
            defaultSummary={(
              draft?.summary ??
              ticket.reports[0]?.description ??
              ""
            ).slice(0, 200)}
            defaultCategory={
              draft && draft.categoryCandidate !== "unknown"
                ? draft.categoryCandidate
                : null
            }
            defaultPriority={
              draft && draft.priorityCandidate !== "unknown"
                ? draft.priorityCandidate
                : "normal"
            }
            locations={await listSiteLocations(
              db,
              member.tenantId,
              ticket.siteId,
            )}
            defaultLocationId={ticket.locationId}
          />
        </Panel>
      ) : null}
      {canAsk ? (
        <Panel id="ask-reporter" title="Need more from the reporter?">
          <RequestClarificationForm
            {...ref}
            missingFields={draft?.missing_fields ?? []}
          />
        </Panel>
      ) : null}
      {canResume ? (
        <Panel
          id="resume"
          title={
            isAnswerWaiting
              ? "The reporter answered"
              : "Waiting for the reporter"
          }
        >
          <p className="text-muted-foreground">
            {isAnswerWaiting
              ? t(
                  "Read the answer, then return this report to triage. AI prepares a new suggestion that includes it.",
                )
              : t(
                  "The report stays here until they answer. You can also continue without one.",
                )}
          </p>
          <ResumeAfterClarificationForm
            {...ref}
            needsReason={isQuestionUnanswered}
          />
        </Panel>
      ) : null}
      {canAssign ? (
        <Panel id="assign" title="Assign the work">
          <AssignForm
            {...ref}
            technicians={await listTechnicians(
              db,
              member.tenantId,
              ticket.siteId,
            )}
            teams={await listTeams(db, member.tenantId)}
          />
        </Panel>
      ) : null}
      {canComplete ? (
        <Panel id="complete" title="Submit completion">
          <CompletionForm {...ref} checklist={checklistFor(ticket.category)} />
        </Panel>
      ) : null}
      {canWait ? (
        <Panel id="wait" title="Can't continue yet?">
          <WaitForm {...ref} />
        </Panel>
      ) : null}
      {canDecide ? (
        <Panel id="decide" title="Review the proof">
          {pendingAttempt?.submittedBy === member.userId ? (
            <p className="text-muted-foreground">
              {t(
                "You submitted this work, so another supervisor has to review it.",
              )}
            </p>
          ) : (
            <DecisionForm
              {...ref}
              canVerify={canVerifyAttempt({
                photoCount: pendingAttempt?.photos.length ?? 0,
              })}
            />
          )}
        </Panel>
      ) : null}
      {canReopen ? (
        <Panel id="reopen" title="Reopen">
          <ReopenForm {...ref} />
        </Panel>
      ) : null}
      {canCancel && ticket.linkedDuplicates.length === 0 ? (
        <Panel id="cancel" title="Cancel this ticket">
          <CancelForm {...ref} />
        </Panel>
      ) : null}
      {canCancel && ticket.linkedDuplicates.length > 0 ? (
        <p className="type-caption text-muted-foreground">
          {t(
            "To cancel this ticket, first remove the links from the reports that point to it.",
          )}
        </p>
      ) : null}
    </div>
  );
}
