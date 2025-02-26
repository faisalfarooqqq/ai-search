ALTER TABLE "questions" DROP CONSTRAINT "questions_company_id_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "questions" ALTER COLUMN "company_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;