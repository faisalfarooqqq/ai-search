import { getCompanyById } from "@/lib/actions";
import RankingTable from "./ranking-table";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: { companyid: string; providername: string };
}) {
  const company = await getCompanyById(Number(params.companyid));
  if (!company) {
    notFound();
  }
  return <RankingTable id={company.id} provider={params.providername} />;
}
