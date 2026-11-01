import { canViewDashboard, type Role } from "@streetproof/domain";

export type NavLink = { href: string; label: string };

// The overview first, then one destination per job, in the order work flows.
export function navLinksFor(roles: readonly Role[]): NavLink[] {
  return [
    ...(canViewDashboard(roles)
      ? [{ href: "/app/dashboard", label: "Overview" }]
      : []),
    ...(roles.includes("operator")
      ? [{ href: "/app/queue", label: "Queue" }]
      : []),
    ...(roles.includes("technician")
      ? [{ href: "/app/work", label: "My work" }]
      : []),
    ...(roles.includes("supervisor")
      ? [{ href: "/app/reviews", label: "Reviews" }]
      : []),
    ...(roles.includes("tenant_admin")
      ? [
          { href: "/app/members", label: "Members" },
          { href: "/app/audit", label: "Audit log" },
        ]
      : []),
  ];
}
