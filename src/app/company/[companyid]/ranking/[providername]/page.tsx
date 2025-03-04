import { getCompanyById } from "@/lib/actions";
import RankingTable from "./ranking-table";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: { companyid: string; providername: string };
}) {
  const company = await getCompanyById(Number(params.companyid));
  if (!company) {
    notFound();
  }
  return (
    <>
      <Suspense fallback={<div>Loading</div>}>
        <RankingTable id={company.id} provider={params.providername} />;
      </Suspense>
    </>
  );
}
