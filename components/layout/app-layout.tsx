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
      <SidebarInset className="bg-sidebar">
      <header className="sticky top-0 z-50 flex h-8 items-center gap-2 bg-sidebar ">
        <SidebarTrigger/>
        </header>
        <div className="py-4 px-6">
          {children}
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  );
}
