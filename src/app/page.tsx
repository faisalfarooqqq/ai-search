import { Button } from "@/components/ui/button";
import CompaniesList from "../components/ui/companies-list";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Companies Directory
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <CompaniesList />
        <div className="mt-6 flex justify-center">
          <Link href="/company/new">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Add New Company
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
