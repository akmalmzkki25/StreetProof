CREATE TABLE "clarifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"ticket_id" uuid NOT NULL,
	"report_id" uuid NOT NULL,
	"question" text NOT NULL,
	"asked_by" text NOT NULL,
	"asked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answer" text,
	"answered_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	CONSTRAINT "clarifications_answer_has_time" CHECK (("clarifications"."answer" is null) = ("clarifications"."answered_at" is null))
);
--> statement-breakpoint
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_asked_by_user_id_fk" FOREIGN KEY ("asked_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_tenant_id_ticket_id_tickets_tenant_id_id_fk" FOREIGN KEY ("tenant_id","ticket_id") REFERENCES "public"."tickets"("tenant_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_tenant_id_report_id_reports_tenant_id_id_fk" FOREIGN KEY ("tenant_id","report_id") REFERENCES "public"."reports"("tenant_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clarifications_one_open_per_ticket" ON "clarifications" USING btree ("ticket_id") WHERE "clarifications"."closed_at" is null;--> statement-breakpoint
CREATE INDEX "clarifications_report_id_index" ON "clarifications" USING btree ("report_id");