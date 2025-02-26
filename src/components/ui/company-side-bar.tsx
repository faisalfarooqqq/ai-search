import Link from "next/link";
import { useParams } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "./sidebar";
import { BarChart2, CircleGauge, HelpCircle } from "lucide-react";

export default function CompaniesSidebar() {
  const params = useParams();
  const companyid = params.companyid;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/company/${companyid}/questions`}>
                <HelpCircle className="mr-2" />
                <span>Questions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/company/${companyid}/dashboard`}>
                {" "}
                <CircleGauge className="mr-2" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={`/company/${companyid}/ranking`}>
                <BarChart2 className="mr-2" />
                <span>Ranking</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
