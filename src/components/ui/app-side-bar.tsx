"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import HomeSidebarContent from "./home-side-bar";
import CompaniesSidebar from "./company-side-bar";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton size="lg">AI Search</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {pathname === "/" || pathname === "/company/new" ? (
            <HomeSidebarContent />
          ) : (
            <CompaniesSidebar />
          )}
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className="absolute top-4 left-4 z-50 md:hidden" />
    </>
  );
}
