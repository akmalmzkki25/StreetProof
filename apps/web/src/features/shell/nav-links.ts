import { canViewDashboard, type Role } from "@streetproof/domain";

export type NavLink = { href: string; label: string };

// One destination per job a member's roles give them, in the order work flows.
export function navLinksFor(roles: readonly Role[]): NavLink[] {
  return [
    ...(roles.includes("operator")
      ? [{ href: "/app/queue", label: "Queue" }]
      : []),
    ...(roles.includes("technician")
      ? [{ href: "/app/work", label: "My work" }]
      : []),
    ...(roles.includes("supervisor")
      ? [{ href: "/app/reviews", label: "Reviews" }]
      : []),
    ...(canViewDashboard(roles)
      ? [{ href: "/app/dashboard", label: "Overview" }]
      : []),
  ];
}
