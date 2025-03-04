import { getCompanyById } from "@/lib/actions";
import CompanyDashBoard from "./CompanyDashboard";
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

  return <CompanyDashBoard company={company} />;
}
