"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { MenuItem } from "@/types/menu";
import Link from "next/link";

export function NavMain({ items }: { items: MenuItem[] }) {
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      <Link href={item.path} className="flex w-full min-w-0 items-center gap-2">
                        {item.icon && <item.icon className="shrink-0 h-5 w-5"/>}
                        <span className="flex-1 truncate">{item.title}</span>
                      </Link>
                      {hasChildren && (
                        <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {hasChildren && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.id}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.path}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
