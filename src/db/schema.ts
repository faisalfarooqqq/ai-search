import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  siteUrl: varchar("site_url", { length: 255 }).notNull(),
});

// Questions table: Each question is linked to a company.
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }), // Enable cascading delete
  questionText: text("question_text").notNull(),
});

// LLM Models table: Optional table to track details about each LLM model.
export const llmModels = pgTable("llm_models", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
});

// LLM Results table: Records details of each query/response including ranking.
export const llmResults = pgTable("llm_results", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id, {
    onDelete: "cascade",
  }),
  modelId: integer("model_id").references(() => llmModels.id),
  rank: integer("rank"), // Rank position (null if not mentioned).
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

//
// Define Relationships
//

// Companies have many questions.
export const companiesRelations = relations(companies, ({ many }) => ({
  questions: many(questions),
}));

// Questions belong to one company and can have many LLM results.
export const questionsRelations = relations(questions, ({ one, many }) => ({
  company: one(companies, {
    fields: [questions.companyId],
    references: [companies.id],
  }),
  llmResults: many(llmResults),
}));

// LLM Models can have many LLM results.
export const llmModelsRelations = relations(llmModels, ({ many }) => ({
  llmResults: many(llmResults),
}));

// Each LLM result is linked to one question and one LLM model.
export const llmResultsRelations = relations(llmResults, ({ one }) => ({
  question: one(questions, {
    fields: [llmResults.questionId],
    references: [questions.id],
  }),
  llmModel: one(llmModels, {
    fields: [llmResults.modelId],
    references: [llmModels.id],
  }),
}));
