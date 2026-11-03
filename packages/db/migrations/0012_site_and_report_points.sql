ALTER TABLE "reports" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_point_complete" CHECK (("reports"."latitude" is null and "reports"."longitude" is null) or ("reports"."latitude" is not null and "reports"."longitude" is not null and "reports"."latitude" between -90 and 90 and "reports"."longitude" between -180 and 180));--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_point_complete" CHECK (("sites"."latitude" is null and "sites"."longitude" is null) or ("sites"."latitude" is not null and "sites"."longitude" is not null and "sites"."latitude" between -90 and 90 and "sites"."longitude" between -180 and 180));