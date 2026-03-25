import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthGuard } from "@/components/layout/auth-guard";
import {
  DevBannerProvider,
  DevBannerStrip,
  DevBannerToggle,
} from "@/components/layout/dev-banner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DevBannerProvider>
            <DevBannerStrip />
            <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
              </div>
              <div className="flex items-center gap-1">
                <DevBannerToggle />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </DevBannerProvider>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
