import { getCompanyById } from "@/lib/actions";
import { notFound } from "next/navigation";
import CompanyDashBoard from "../CompanyDashboard";

export default async function Page({
  params,
}: {
  params: { companyid: string };
}) {
  const company = await getCompanyById(Number(params.companyid));
  if (!company) {
    notFound();
  }

  return <CompanyDashBoard company={company} />;
}
