CREATE TABLE "damage_regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"report_id" uuid NOT NULL,
	"upload_id" uuid NOT NULL,
	"source" text NOT NULL,
	"label" text NOT NULL,
	"frame_width" integer NOT NULL,
	"frame_height" integer NOT NULL,
	"left" integer NOT NULL,
	"top" integer NOT NULL,
	"right" integer NOT NULL,
	"bottom" integer NOT NULL,
	"mask_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "damage_regions" ADD CONSTRAINT "damage_regions_tenant_id_report_id_reports_tenant_id_id_fk" FOREIGN KEY ("tenant_id","report_id") REFERENCES "public"."reports"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damage_regions" ADD CONSTRAINT "damage_regions_upload_id_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."uploads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "damage_regions_report_id_index" ON "damage_regions" USING btree ("report_id");