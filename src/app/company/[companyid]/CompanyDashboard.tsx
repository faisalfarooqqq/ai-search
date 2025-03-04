import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { BarChart2, HelpCircle } from "lucide-react";
import Link from "next/link";

export default async function CompanyDashBoard({ company }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Welcome to {company.name} Dashboard
      </h1>
      <div className="grid md:grid-cols-2 gap-6">
        <Link href={`/company/${company.id}/ranking`} passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2" />
                Ranking
              </CardTitle>
              <CardDescription>
                View and analyze company rankings
              </CardDescription>
            </CardHeader>
            <Button className="m-4">View Rankings</Button>
          </Card>
        </Link>
        <Link href={`/company/${company.id}/questions`} passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2" />
                Questions
              </CardTitle>
              <CardDescription>
                Manage and review company questions
              </CardDescription>
            </CardHeader>
            <Button className="m-4">View Questions</Button>
          </Card>
        </Link>
      </div>
    </div>
  );
}
