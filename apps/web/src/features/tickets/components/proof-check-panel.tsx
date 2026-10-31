import { parseProofCheck } from "@streetproof/contracts";
import type { TicketDetail } from "@streetproof/db";
import { Badge } from "@streetproof/ui/components/badge";

import { FactList } from "./ai-draft-panel";
import { AiRefresher } from "./ai-refresher";

type Attempt = TicketDetail["attempts"][number];

const PENDING_STATES = ["queued", "running", "failed_retryable"];

const SAME_LOCATION_LABELS = {
  same: "Looks like the same place",
  different: "Looks like a different place or object",
  unclear: "Can't tell from the photos",
} as const;

const REPORTED_PROBLEM_LABELS = {
  not_visible: "Not visible in the new photos",
  still_visible: "Still visible in the new photos",
  unclear: "Can't tell from the photos",
} as const;

function Reading({ label, isWarning }: { label: string; isWarning: boolean }) {
  return isWarning ? <Badge variant="destructive">{label}</Badge> : label;
}

function asFacts(items: string[]) {
  return items.map((text, index) => ({ key: String(index), text }));
}

// A hint beside the photos. It never blocks a decision, and nothing here reads as
// approval: there's no "good" state, only things worth a closer look.
export function ProofCheckPanel({ attempt }: { attempt: Attempt }) {
  const check = attempt.proofCheck;
  if (!check || check.state === "skipped_manual") return null;
  const isUndecided = attempt.status === "pending";

  if (PENDING_STATES.includes(check.state)) {
    if (!isUndecided) return null;
    return (
      <div className="rounded-4xl bg-surface-raised p-5 shadow-inset">
        <AiRefresher />
        <p className="text-muted-foreground">
          AI is comparing the photos. You don&apos;t have to wait to decide.
        </p>
      </div>
    );
  }

  const parsed = parseProofCheck(check.result);
  if (check.state !== "succeeded" || !parsed.success) {
    if (!isUndecided) return null;
    return (
      <div className="rounded-4xl bg-surface-raised p-5 shadow-inset">
        <p className="text-muted-foreground">
          The AI comparison isn&apos;t available. Review the photos yourself.
        </p>
      </div>
    );
  }
  const result = parsed.data;

  return (
    <section
      aria-label="AI comparison"
      className="flex flex-col gap-4 rounded-4xl bg-surface-raised p-5 shadow-inset"
    >
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="self-start">
          Not verified
        </Badge>
        <p className="type-caption text-muted-foreground">
          AI comparison from {check.model}. It can&apos;t confirm a repair, and
          the decision is yours.
        </p>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
        <dt className="text-muted-foreground">Location</dt>
        <dd>
          <Reading
            label={SAME_LOCATION_LABELS[result.sameLocation]}
            isWarning={result.sameLocation === "different"}
          />
        </dd>
        <dt className="text-muted-foreground">Reported problem</dt>
        <dd>
          <Reading
            label={REPORTED_PROBLEM_LABELS[result.reportedProblem]}
            isWarning={result.reportedProblem === "still_visible"}
          />
        </dd>
      </dl>
      <FactList
        title="What the photos show"
        items={asFacts(result.observations)}
      />
      <FactList
        title="Not shown in the proof"
        items={asFacts(result.missingProof)}
      />
      <FactList
        title="Limits of this comparison"
        items={asFacts(result.limitations)}
      />
    </section>
  );
}
