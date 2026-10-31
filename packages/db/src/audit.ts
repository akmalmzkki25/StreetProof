import { desc, eq } from "drizzle-orm";
import type { Db, Transaction } from "./client";
import { auditLog, user } from "./schema";

const AUDIT_PAGE_SIZE = 200;

export type AuditEntry = {
  tenantId: string;
  actorId: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function recordAudit(db: Db | Transaction, entry: AuditEntry) {
  await db.insert(auditLog).values(entry);
}

export async function listAuditLog(db: Db, tenantId: string) {
  return db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      metadata: auditLog.metadata,
      actorName: user.name,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(user, eq(user.id, auditLog.actorId))
    .where(eq(auditLog.tenantId, tenantId))
    .orderBy(desc(auditLog.createdAt))
    .limit(AUDIT_PAGE_SIZE);
}
