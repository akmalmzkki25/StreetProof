import type { Role } from "@streetproof/domain";

export const ROLE_LABELS: Record<Role, string> = {
  operator: "Operator",
  technician: "Technician",
  supervisor: "Supervisor",
  tenant_admin: "Tenant admin",
};

const AUDIT_LABELS: Record<string, string> = {
  "auth.signed_in": "Signed in",
  "auth.sign_in_failed": "Failed sign-in",
  "auth.password_reset": "Reset their password",
  "member.created": "Added a member",
  "member.access_changed": "Changed a member's access",
  "member.deactivated": "Deactivated a member",
  "member.reactivated": "Reactivated a member",
  "member.password_set": "Set a member's password",
  "team.created": "Added a team",
  "team.retired": "Retired a team",
  "status_link.reissued": "Created a new status link",
  "ticket.viewed": "Opened a ticket",
};

export function auditLabel(action: string) {
  return AUDIT_LABELS[action] ?? action;
}
