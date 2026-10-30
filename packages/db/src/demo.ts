import type { Role } from "@streetproof/domain";

// Synthetic demo data only. Every demo account shares this local test password.
export const DEMO_PASSWORD = "streetproof-demo";

export type DemoUser = { name: string; email: string; roles: Role[] };

export type DemoTenant = {
  tenantName: string;
  siteName: string;
  intakeCode: string;
  locationNames: string[];
  users: DemoUser[];
};

export const DEMO_TENANTS: DemoTenant[] = [
  {
    tenantName: "Graha Contoh (synthetic)",
    siteName: "Graha Contoh Tower A",
    intakeCode: "graha-tower-a",
    locationNames: [
      "Lobby",
      "Floor 3 pantry",
      "Floor 7 restroom",
      "Basement parking B1",
    ],
    users: [
      {
        name: "Dewi Operator",
        email: "operator@streetproof.test",
        roles: ["operator"],
      },
      {
        name: "Budi Technician",
        email: "technician@streetproof.test",
        roles: ["technician"],
      },
      {
        name: "Rina Technician",
        email: "technician2@streetproof.test",
        roles: ["technician"],
      },
      {
        name: "Sari Supervisor",
        email: "supervisor@streetproof.test",
        roles: ["supervisor"],
      },
      {
        name: "Admin Graha",
        email: "admin@streetproof.test",
        roles: ["tenant_admin", "operator", "supervisor"],
      },
    ],
  },
  // A second tenant exists so tenant isolation can be tested against real rows.
  {
    tenantName: "Kampus Contoh (synthetic)",
    siteName: "Kampus Contoh Main Building",
    intakeCode: "kampus-main",
    locationNames: ["Library", "Hall B"],
    users: [
      {
        name: "Other Tenant Operator",
        email: "operator@kampus.streetproof.test",
        roles: ["operator"],
      },
    ],
  },
];
