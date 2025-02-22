import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Define the companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  siteUrl: varchar("site_url", { length: 255 }).notNull(),
});

// Define the questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id),
  questionText: text("question_text").notNull(),
});

// Define relationships
export const companiesRelations = relations(companies, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  company: one(companies, {
    fields: [questions.companyId],
    references: [companies.id],
  }),
}));
