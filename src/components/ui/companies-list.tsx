import { getCompanies } from "@/lib/actions";
import Link from "next/link";

export default async function CompaniesList() {
  const companies = await getCompanies();
  return (
    <div>
      {companies.map((company) => (
        <div key={company.id}>
          <Link href={`/company/${company.id}`}>
            <span>{company.name}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
