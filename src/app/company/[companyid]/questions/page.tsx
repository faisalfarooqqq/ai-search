import { getCompanyWithQuestionsById } from "@/lib/actions";
import { notFound } from "next/navigation";
import QuestionsForm from "./questions-form";

export default async function CompanyQuestionsPage({
  params,
}: {
  params: { companyid: string };
}) {
  const company = await getCompanyWithQuestionsById(Number(params.companyid));

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{company.name} Questions</h1>
      <QuestionsForm
        initialQuestions={company.questions.map((q) => q.questionText)}
        companyId={company.id}
      />
    </div>
  );
}
