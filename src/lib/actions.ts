"use server";

import { OpenAI } from "openai";
import { db } from "@/db";
import { companies, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleQuestions(site: string, questionList: string[]) {
  if (!site.trim()) {
    return { error: "Site URL is required." };
  }

  const responses: { question: string; answer?: string; error?: string }[] = [];

  for (const question of questionList) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",

        messages: [{ role: "user", content: question }],
      });
      responses.push({
        question,
        answer: response.choices[0].message.content ?? undefined,
      });
    } catch (error) {
      console.log(error);
      responses.push({ question, error: "Failed to fetch response" });
    }
  }

  return { responses };
}

export async function addCompanyWithQuestions(
  name: string,
  siteUrl: string,
  questionTexts: string[]
) {
  const insertedCompany = await db
    .insert(companies)
    .values({ name, siteUrl })
    .returning();
  const companyId = insertedCompany[0].id;

  for (const questionText of questionTexts) {
    await db.insert(questions).values({ companyId, questionText });
  }
}

export async function getCompanies() {
  const result = await db.select().from(companies);
  return result;
}

export async function getCompanyById(companyId: number) {
  return await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: { questions: true },
  });
}
