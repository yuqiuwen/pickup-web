"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MenuItem } from "@/types/menu";
import { useMenu } from "@/hooks/use-menu";
import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User, LogOut, Rose, Frame } from "lucide-react";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { NavMain } from "@/components/layout/nav-main";

interface SidebarProps {
  menuConfig: MenuItem[];
}

export function AppSidebar({ menuConfig }: { menuConfig: MenuItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const filteredMenu = useMenu(menuConfig);
  const { user, logout, openLoginDrawer } = useAuth();

  const teams = [
    {
      name: "PickUP",
      logo: Rose,
      plan: "",
    },
  ];

  const projects = [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleSettings = () => {
    router.push("/profile/settings");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredMenu} />
        {/* <NavProjects projects={projects} /> */}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <NavUser
          user={user}
          logout={handleLogout}
          viewProfile={handleProfile}
          viewSettings={handleSettings}
          openLoginDrawer={openLoginDrawer}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
