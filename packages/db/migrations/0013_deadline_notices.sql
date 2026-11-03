CREATE TABLE "deadline_notices" (
	"ticket_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deadline_notices_ticket_id_kind_due_at_pk" PRIMARY KEY("ticket_id","kind","due_at")
);
--> statement-breakpoint
ALTER TABLE "deadline_notices" ADD CONSTRAINT "deadline_notices_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;