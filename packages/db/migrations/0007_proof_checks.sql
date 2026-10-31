CREATE TABLE "proof_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"completion_id" uuid NOT NULL,
	"model" text,
	"prompt_version" text,
	"state" "ai_draft_state" DEFAULT 'queued' NOT NULL,
	"result" jsonb,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"input_digest" text,
	"latency_ms" integer,
	"usage" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "proof_checks_completionId_unique" UNIQUE("completion_id")
);
--> statement-breakpoint
ALTER TABLE "proof_checks" ADD CONSTRAINT "proof_checks_tenant_id_completion_id_completion_submissions_tenant_id_id_fk" FOREIGN KEY ("tenant_id","completion_id") REFERENCES "public"."completion_submissions"("tenant_id","id") ON DELETE cascade ON UPDATE no action;