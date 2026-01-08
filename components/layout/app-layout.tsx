"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { menuConfig } from "@/config/menu";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar menuConfig={menuConfig} />
      <SidebarInset>
        <SidebarTrigger />
        <div className="p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
