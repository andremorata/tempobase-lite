"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  CalendarDays,
  FolderOpen,
  Users2,
  Tags,
  LayoutDashboard,
  BarChart2,
  Upload,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

const trackingItems = [
  { title: "Tracker", href: "/tracker", icon: Clock },
  { title: "Timesheet", href: "/timesheet", icon: CalendarDays },
];

const manageItems = [
  { title: "Projects", href: "/projects", icon: FolderOpen },
  { title: "Clients", href: "/clients", icon: Users2 },
  { title: "Tags", href: "/tags", icon: Tags },
];

const insightItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Reports", href: "/reports", icon: BarChart2 },
];

const dataItems = [
  { title: "Import", href: "/imports", icon: Upload },
];

const accountItems = [
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Audit", href: "/audit", icon: ShieldCheck, adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const canViewAudit = user?.role === "Owner" || user?.role === "Admin";

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/25">
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="font-semibold tracking-tight">TempoBase</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Time Tracking</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trackingItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insightItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Data</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dataItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems
                .filter((item) => !item.adminOnly || canViewAudit)
                .map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs text-muted-foreground truncate">
              {user.firstName} {user.lastName}
            </span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => logout()}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
