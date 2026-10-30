import type { WorkStage } from "@streetproof/domain";

export const STAGE_LABELS: Record<
  WorkStage,
  { title: string; owner: string; state: string }
> = {
  triage: { title: "Needs triage", owner: "Operator", state: "needs triage" },
  assignment: {
    title: "Ready to assign",
    owner: "Operator",
    state: "is ready to assign",
  },
  repair: {
    title: "With technicians",
    owner: "Technician",
    state: "is with a technician",
  },
  blocked: {
    title: "Waiting on parts or access",
    owner: "Technician",
    state: "is waiting on parts or access",
  },
  verification: {
    title: "Awaiting verification",
    owner: "Supervisor",
    state: "is awaiting verification",
  },
};

export const AGE_LABELS = {
  under_1_day: "Under 1 day",
  "1_to_3_days": "1 to 3 days",
  "3_to_7_days": "3 to 7 days",
  over_7_days: "Over 7 days",
} as const;
