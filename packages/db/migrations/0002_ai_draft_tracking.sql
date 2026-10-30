ALTER TABLE "ai_drafts" ALTER COLUMN "state" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "ai_drafts" ALTER COLUMN "state" SET DEFAULT 'queued'::text;--> statement-breakpoint
DROP TYPE "public"."ai_draft_state";--> statement-breakpoint
CREATE TYPE "public"."ai_draft_state" AS ENUM('queued', 'running', 'succeeded', 'failed_retryable', 'failed_terminal', 'skipped_manual', 'cancelled');--> statement-breakpoint
ALTER TABLE "ai_drafts" ALTER COLUMN "state" SET DEFAULT 'queued'::"public"."ai_draft_state";--> statement-breakpoint
ALTER TABLE "ai_drafts" ALTER COLUMN "state" SET DATA TYPE "public"."ai_draft_state" USING "state"::"public"."ai_draft_state";--> statement-breakpoint
DROP INDEX "ai_drafts_tenant_id_report_id_index";--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD COLUMN "attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD COLUMN "input_digest" text;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD COLUMN "latency_ms" integer;--> statement-breakpoint
ALTER TABLE "ai_drafts" ADD COLUMN "usage" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_drafts_one_per_input" ON "ai_drafts" USING btree ("report_id","input_revision","prompt_version");