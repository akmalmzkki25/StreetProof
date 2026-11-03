import {
  clearConversation,
  getConversation,
  saveConversation,
  type Db,
  type ReportPhoto,
} from "@streetproof/db";

export type ReportState = {
  flow: "report";
  step:
    | "location"
    | "location_text"
    | "description"
    | "confirm_transcript"
    | "photos";
  tenantId: string;
  siteId: string;
  // Kept for the whole flow, so pressing send twice can't file two reports.
  submissionKey: string;
  reportId: string;
  locations: { id: string; name: string }[];
  locationChoice: string | null;
  locationText: string | null;
  // A location shared in the chat. Optional, and never sent to a model.
  point?: { latitude: number; longitude: number } | null;
  description: string | null;
  transcript: string | null;
  photos: ReportPhoto[];
};

export type ProofState = {
  flow: "proof";
  step: "checks" | "note" | "photos";
  ticketId: string;
  expectedRevision: number;
  checkedIds: string[];
  note: string | null;
  photos: ReportPhoto[];
};

export type DecisionState = {
  flow: "decision";
  decision: "accepted" | "rejected";
  ticketId: string;
  expectedRevision: number;
};

export type AnswerState = {
  flow: "answer";
  reportId: string;
  clarificationId: string;
};

export type ChatState = ReportState | ProofState | DecisionState | AnswerState;

export async function loadState(db: Db, chatId: string) {
  return (await getConversation(db, chatId)) as ChatState | null;
}

export function saveState(db: Db, chatId: string, state: ChatState) {
  return saveConversation(db, chatId, state);
}

export function clearState(db: Db, chatId: string) {
  return clearConversation(db, chatId);
}
