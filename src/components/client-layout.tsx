"use client"

import { ArtistProvider, useArtist } from "@/contexts/artist-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface ClientLayoutProps {
  children: ReactNode;
}

function LayoutContent({ children }: ClientLayoutProps) {
  const { isAuthenticated } = useArtist();
  const pathname = usePathname();
  
  // Pages that should not show the sidebar
  const noSidebarPages = ['/login', '/signup'];
  const shouldShowSidebar = isAuthenticated && !noSidebarPages.includes(pathname);
  
  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="text-sm font-medium text-foreground">
                Business Intelligence Dashboard
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // Full page layout for login and other non-sidebar pages
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ArtistProvider>
        <LayoutContent>
          {children}
        </LayoutContent>
      </ArtistProvider>
    </ThemeProvider>
  );
}