ALTER TABLE "completion_submissions" ADD COLUMN "checklist" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "completion_submissions" ADD COLUMN "exception_reason" text;