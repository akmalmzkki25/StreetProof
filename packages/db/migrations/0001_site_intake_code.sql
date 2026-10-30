ALTER TABLE "sites" ADD COLUMN "intake_code" text;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_intakeCode_unique" UNIQUE("intake_code");