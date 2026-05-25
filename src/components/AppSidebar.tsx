"use client";

import { MessageSquare, Settings, Terminal, Shield, PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const items = [
  {
    title: "New Pentest",
    url: "/",
    icon: PlusCircle,
  },
  {
    title: "Agent Sandbox",
    url: "/sandbox",
    icon: Terminal,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="w-6 h-6" />
          <span>Ultron</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Recent Scans</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* This will be populated by Convex later */}
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="#" />}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>scanme.nmap.org</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<a href="#" />}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Localhost Recon</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t text-sm text-muted-foreground text-center">
        Ultron v3.0
      </SidebarFooter>
    </Sidebar>
  );
}
