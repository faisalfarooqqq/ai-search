"use client";

import { Globe, Menu } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCompanies } from "@/lib/actions";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Company {
  id: number;
  name: string;
  siteUrl: string;
}

export function AppSidebar() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const companies = await getCompanies();

        setCompanies(companies);
      } catch (err: any) {
        setError(err.message || "Failed to load companies");
      }
    }
    loadCompanies();
  }, []);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <Menu className="h-4 w-4 mr-2" />
                Companies
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {error && <p className="text-red-500">{error}</p>}
            {companies.map((company) => (
              <SidebarMenuItem key={company.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/company/${company.id}`}>
                    <Globe className="h-4 w-4 mr-2" />
                    {company.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className="absolute top-4 left-4 z-50 md:hidden" />
    </>
  );
}
