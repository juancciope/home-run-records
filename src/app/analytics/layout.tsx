"use client"

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PersistentArtistHeader } from "@/components/persistent-artist-header";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = 'force-dynamic'


export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-24 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex-1">
                  <PersistentArtistHeader />
                </div>
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-6 pt-2">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}