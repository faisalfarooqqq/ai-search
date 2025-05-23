"use server";

import { OpenAI } from "openai";
import { db } from "@/db";
import { companies, llmModels, llmResults, questions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";

export type Question = {
  id: number;
  questionText: string;
};

export async function getNewGPTRanking(id: number) {
  const company = await getCompanyWithQuestionsById(id);
  if (!company) {
    return { error: "Company not found" };
  }

  const models = ["gpt-3.5-turbo", "chatgpt-4o-latest"];
  const questions: Question[] = company.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
  }));

  for (const model of models) {
    const result = await handleOpenAIQuestions(questions, model);

    if (!result.responses) {
      console.warn("No responses found");
      continue;
    }

    for (const response of result.responses) {
      if (!response.questionId) {
        console.error("Missing questionId for response:", response);
        continue;
      }

      const modelId = await getOrCreateModelId(model, "openai");

      if (!response.answer) {
        await db.insert(llmResults).values({
          questionId: response.questionId,
          modelId,
          rank: null,
        });
        continue;
      }

      const rank = await getBrandRankFromGptResponse(
        response.answer,
        company.name,
        company.siteUrl,
        model
      );

      await db.insert(llmResults).values({
        questionId: response.questionId,
        modelId,
        rank,
      });
    }
  }

  revalidatePath("/companies");

  return { success: true };
}

export async function getNewClaudeRanking(id: number) {
  const company = await getCompanyWithQuestionsById(id);
  if (!company) {
    return { error: "Company not found" };
  }

  const models = ["claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"];
  const questions: Question[] = company.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
  }));

  for (const model of models) {
    const result = await handleClaudeQuestions(questions, model);

    if (!result.responses) {
      console.warn("No responses found");
      continue;
    }

    for (const response of result.responses) {
      if (!response.questionId) {
        console.error("Missing questionId for response:", response);
        continue;
      }

      const modelId = await getOrCreateModelId(model, "claude");

      if (!response.answer) {
        await db.insert(llmResults).values({
          questionId: response.questionId,
          modelId,
          rank: null,
        });
        continue;
      }

      const rank = await getBrandRankFromClaudeResponse(
        response.answer,
        company.name,
        company.siteUrl,
        model
      );

      await db.insert(llmResults).values({
        questionId: response.questionId,
        modelId,
        rank,
      });
    }
  }

  revalidatePath("/companies");

  return { success: true };
}

export async function getNewGeminiRanking(id: number) {
  const company = await getCompanyWithQuestionsById(id);
  if (!company) {
    return { error: "Company not found" };
  }

  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const questions: Question[] = company.questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
  }));

  for (const model of models) {
    const result = await handleGeminiQuestions(questions, model);

    if (!result.responses) {
      console.warn("No responses found");
      continue;
    }

    for (const response of result.responses) {
      if (!response.questionId) {
        console.error("Missing questionId for response:", response);
        continue;
      }

      const modelId = await getOrCreateModelId(model, "gemini");
      if (!response.answer) {
        continue;
      }

      const rank = await getBrandRankFromGeminiResponse(
        response.answer,
        company.name,
        company.siteUrl,
        model
      );

      await db.insert(llmResults).values({
        questionId: response.questionId,
        modelId,
        rank,
      });
    }
  }

  revalidatePath("/companies");

  return { success: true };
}

export async function handleOpenAIQuestions(
  questionList: Question[],
  model: string
) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const responses: {
    questionId: number;
    question: string;
    answer?: string;
    error?: string;
  }[] = [];

  for (const q of questionList) {
    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: `
            When answering questions, always follow this structured format:
      
            **Introduction**
            - Provide a brief overview summarizing key points.
            - Keep it concise and relevant to the question.
      
            **Main Content (List, Steps, Explanation, etc.)**
            - If the answer involves multiple items, present them in a numbered or bullet-point format.
            - For each item, include:
              - Name or Title (if applicable)
              - Description (what it is, why it matters)
              - Key Details (e.g., benefits, features, challenges, or considerations)
              - Best For / Use Cases (if applicable)
      
            **Conclusion**
            - Provide a short summary or key takeaway.
            - Optionally, include recommendations or next steps.
          `,
          },
          { role: "user", content: q.questionText },
        ],
      });
      responses.push({
        questionId: q.id,
        question: q.questionText,
        answer: response.choices[0].message.content ?? undefined,
      });
    } catch (error) {
      console.error(
        `Error with model ${model} for question "${q.questionText}":`,
        error
      );
      responses.push({
        questionId: q.id,
        question: q.questionText,
        error: "Failed to fetch response",
      });
    }
  }

  return { responses };
}

export async function handleGeminiQuestions(
  questionList: Question[],
  model: string
) {
  const responses = [];
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  for (const question of questionList) {
    try {
      const modelInstance = gemini.getGenerativeModel({
        model: model,
        systemInstruction: `
        When answering questions, always follow this structured format:
  
        **Introduction**
        - Provide a brief overview summarizing key points.
        - Keep it concise and relevant to the question.
  
        **Main Content (List, Steps, Explanation, etc.)**
        - If the answer involves multiple items, present them in a numbered or bullet-point format.
        - For each item, include:
          - Name or Title (if applicable)
          - Description (what it is, why it matters)
          - Key Details (e.g., benefits, features, challenges, or considerations)
          - Best For / Use Cases (if applicable)
  
        **Conclusion**
        - Provide a short summary or key takeaway.
        - Optionally, include recommendations or next steps.
      `,
      });
      const response = await modelInstance.generateContent(
        question.questionText
      );
      responses.push({
        questionId: question.id,
        question: question.questionText,
        answer: response.response.text() ?? "No response",
      });
    } catch (error) {
      console.error(
        `Error with model ${model} for question "${question.questionText}":`,
        error
      );
      responses.push({
        questionId: question.id,
        question: question.questionText,
        error: "Failed to fetch response",
      });
    }
  }

  return { responses };
}

export async function handleClaudeQuestions(
  questionList: Question[],
  model: string
) {
  const responses = [];
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  for (const question of questionList) {
    try {
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: 1024,

        messages: [
          {
            role: "user",
            content: [{ type: "text", text: question.questionText }],
          },
        ],
      });

      let answerText = "";
      for (const block of response.content) {
        if (block.type === "text") {
          answerText = block.text;
          break;
        }
      }

      responses.push({
        questionId: question.id,
        question: question.questionText,
        answer: answerText,
      });
    } catch (error) {
      console.error(
        `Error with model ${model} for question "${question.questionText}":`,
        error
      );
      responses.push({
        questionId: question.id,
        question: question.questionText,
        error: "Failed to fetch response",
      });
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

  // Revalidate the companies list page
  revalidatePath("/companies");

  // Revalidate the home page
  revalidatePath("/");

  return { success: true, message: "Company and questions added successfully" };
}

export async function getCompanies() {
  const result = await db.select().from(companies);
  return result;
}

export async function getCompanyById(companyId: number) {
  return await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
  });
}
export async function getCompanyWithQuestionsById(companyId: number) {
  return await db.query.companies.findFirst({
    where: eq(companies.id, companyId),
    with: { questions: true },
  });
}

export async function updateCompanyQuestions(
  companyId: number,
  newQuestions: string[]
) {
  await db.delete(questions).where(eq(questions.companyId, companyId));

  for (const question of newQuestions) {
    await db.insert(questions).values({
      companyId: companyId,
      questionText: question,
    });
  }
  revalidatePath("/companies");

  return { success: true };
}

async function getOrCreateModelId(
  modelName: string,
  providerName: string
): Promise<number> {
  const existing = await db
    .select()
    .from(llmModels)
    .where(eq(llmModels.name, modelName))
    .limit(1);
  if (existing.length) {
    return existing[0].id;
  }
  const inserted = await db
    .insert(llmModels)
    .values({ name: modelName, description: providerName })
    .returning({ id: llmModels.id });
  return inserted[0].id;
}

export async function fetchRankingData(id: number, provider: string) {
  if (provider === "gpt") {
    return fetchGPTRankingData(id);
  } else if (provider === "claude") {
    return fetchClaudeRankingData(id);
  } else if (provider === "gemini") {
    return fetchGeminiRankingData(id);
  } else {
    return [];
  }
}

// This function returns an array of objects, one per question
export async function fetchGPTRankingData(companyId: number) {
  // Fetch all questions for this company.
  const companyQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.companyId, companyId));

  // For each question, fetch the latest result for each model.
  const data = await Promise.all(
    companyQuestions.map(async (q) => {
      // Fetch latest result for GPT-3.5 Turbo
      const [gpt35] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "gpt-3.5-turbo")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      // Fetch latest result for GPT-4 Mini
      const [gpt4mini] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(eq(llmResults.questionId, q.id), eq(llmModels.name, "gpt-4-mini"))
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      // Fetch latest result for GPT-4 Latest
      const [gpt4latest] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "chatgpt-4o-latest")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      return {
        question: q.questionText,
        gpt35: gpt35
          ? {
              rank: gpt35.llm_results.rank,
            }
          : null,
        gpt4mini: gpt4mini
          ? {
              rank: gpt4mini.llm_results.rank,
            }
          : null,
        gpt4latest: gpt4latest
          ? {
              rank: gpt4latest.llm_results.rank,
            }
          : null,
        change: null, // Placeholder: compute changes if needed.
      };
    })
  );

  return data;
}

export async function fetchClaudeRankingData(companyId: number) {
  // Fetch all questions for this company
  const companyQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.companyId, companyId));

  // For each question, fetch the latest result for each Claude model
  const data = await Promise.all(
    companyQuestions.map(async (q) => {
      // Fetch latest result for Claude 3 Sonnet
      const [claude3Sonnet] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "claude-3-7-sonnet-latest")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      // Fetch latest result for Claude 3 Haiku
      const [claude3Haiku] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "claude-3-5-haiku-latest")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      return {
        question: q.questionText,
        claude3Sonnet: claude3Sonnet
          ? {
              rank: claude3Sonnet.llm_results.rank,
            }
          : null,

        claude3Haiku: claude3Haiku
          ? {
              rank: claude3Haiku.llm_results.rank,
            }
          : null,
        change: null, // Placeholder: compute changes if needed
      };
    })
  );

  return data;
}

export async function fetchGeminiRankingData(companyId: number) {
  // Fetch all questions for this company
  const companyQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.companyId, companyId));

  // For each question, fetch the latest result for each Gemini model
  const data = await Promise.all(
    companyQuestions.map(async (q) => {
      // Fetch latest result for Gemini Pro
      const [geminiFlash20] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "gemini-2.0-flash")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      // Fetch latest result for Gemini Ultra
      const [geminiFlash15] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "gemini-1.5-flash")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      // Fetch latest result for Gemini Flash
      const [geminiPro] = await db
        .select()
        .from(llmResults)
        .leftJoin(llmModels, eq(llmResults.modelId, llmModels.id))
        .where(
          and(
            eq(llmResults.questionId, q.id),
            eq(llmModels.name, "gemini-1.5-pro")
          )
        )
        .orderBy(desc(llmResults.createdAt))
        .limit(1);

      return {
        question: q.questionText,
        geminiFlash20: geminiFlash20
          ? {
              rank: geminiFlash20.llm_results.rank,
            }
          : null,
        geminiFlash15: geminiFlash15
          ? {
              rank: geminiFlash15.llm_results.rank,
            }
          : null,
        geminiPro: geminiPro
          ? {
              rank: geminiPro.llm_results.rank,
            }
          : null,
        change: null, // Placeholder: compute changes if needed
      };
    })
  );

  return data;
}

export async function refreshRankingData(id: number, provider: string) {
  if (provider === "gpt") {
    return getNewGPTRanking(id);
  } else if (provider === "claude") {
    return getNewClaudeRanking(id);
  } else if (provider === "gemini") {
    return getNewGeminiRanking(id);
  } else {
    return { error: "Invalid provider" };
  }
}

async function getBrandRankFromGeminiResponse(
  responseText: string,
  companyName: string,
  companyUrl: string,
  model: string
) {
  const prompt = `
  Given the following text, determine the rank of the company "${companyName}" (or its URL: "${companyUrl}").
  If the company is explicitly ranked with a number (for example, "1.", "2)"), reply only with the rank number.
  If the company is mentioned without a clear ranking, give it a rank and reply with rank.
  If the company is not mentioned at all, reply with "null".
  
  Text:
  ${responseText}
  
  Your answer should be exactly one of the following: a number (e.g., "1"), "unranked", or "null".
    `;

  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const modelInstance = gemini.getGenerativeModel({
    model: model,
  });
  const result = await modelInstance.generateContent(prompt);

  const responseTextValue =
    typeof result.response.text === "function"
      ? result.response.text()
      : result.response.text;

  const trimmed = responseTextValue.trim().toLowerCase();
  if (trimmed === "null") return null;
  if (trimmed === "unranked") return null;
  const rank = parseInt(trimmed, 10);
  if (isNaN(rank)) return null;
  return rank;
}

async function getBrandRankFromGptResponse(
  responseText: string,
  companyName: string,
  companyUrl: string,
  model: string
) {
  const prompt = `
  Given the following text, determine the rank of the company "${companyName}" (or its URL: "${companyUrl}").
  If the company is explicitly ranked with a number (for example, "1.", "2)"), reply only with the rank number.
  If the company is mentioned without a clear ranking, give it a rank and reply with rank.
  If the company is not mentioned at all, reply with "null".
  
  Text:
  ${responseText}
  
  Your answer should be exactly one of the following: a number (e.g., "1"), "unranked", or "null".
    `;
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
  });

  const trimmed = response.choices[0].message.content ?? "";
  if (trimmed === "null") return null;
  if (trimmed === "unranked") return null;
  const rank = parseInt(trimmed, 10);
  if (isNaN(rank)) return null;
  return rank;
}

async function getBrandRankFromClaudeResponse(
  responseText: string,
  companyName: string,
  companyUrl: string,
  model: string
) {
  const prompt = `
  Given the following text, determine the rank of the company "${companyName}" (or its URL: "${companyUrl}").
  If the company is explicitly ranked with a number (for example, "1.", "2)"), reply only with the rank number.
  If the company is mentioned without a clear ranking, give it a rank and reply with rank.
  If the company is not mentioned at all, reply with "null".
  
  Text:
  ${responseText}
  `;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }],
      },
    ],
    system: `Your response should be exactly one of the following: a number (e.g., "1"), "unranked", or "null".`,
  });

  let answerText = "";
  for (const block of response.content) {
    if (block.type === "text") {
      answerText = block.text;
      break;
    }
  }

  const trimmed = answerText;
  if (trimmed === "null") return null;
  if (trimmed === "unranked") return null;
  const rank = parseInt(trimmed, 10);
  if (isNaN(rank)) return null;

  return rank;
}
