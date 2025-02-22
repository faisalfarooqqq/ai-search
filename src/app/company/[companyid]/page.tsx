import {
  getCompanyById,
  handleGeminiQuestions,
  handleOpenAIQuestions,
} from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function CompanyPage({
  params,
}: {
  params: { companyid: string };
}) {
  const company = await getCompanyById(Number(params.companyid));
  if (!company) {
    notFound();
  }

  const questionList = company.questions.map(
    (q: { questionText: string }) => q.questionText
  );

  const result = await handleGeminiQuestions(questionList);
  const responseList = result.responses ?? [];
  return (
    <div>
      <h1>{company.name}</h1>
      <h2>Questions &amp; Answers</h2>
      {result.error ? (
        <p className="text-red-500">{result.error}</p>
      ) : (
        responseList.map((res: any, index: number) => (
          <div key={index}>
            <p>
              <strong>Question:</strong> {res.question}
            </p>
            <p>
              <strong>Answer:</strong> {res.answer || res.error}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
