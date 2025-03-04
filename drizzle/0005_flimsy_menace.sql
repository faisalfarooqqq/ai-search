ALTER TABLE "llm_results" DROP CONSTRAINT "llm_results_question_id_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "llm_results" ADD CONSTRAINT "llm_results_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;