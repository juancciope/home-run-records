"use client"

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Activity, User } from "lucide-react";

interface ClientLayoutProps {
  children: ReactNode;
}

// User Header Component
function UserHeader() {
  const { user, currentAgency, hasRole } = useAuth();

  const displayName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.email?.split('@')[0] || "User";

  const getRoleBadge = () => {
    if (hasRole('superadmin')) {
      return (
        <Badge variant="default" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs">
          Super Admin
        </Badge>
      );
    }
    if (hasRole('artist_manager')) {
      return (
        <Badge variant="default" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs">
          Agency Manager
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs">
        Artist
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border-2 border-border">
        <AvatarImage src={user?.avatar_url} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
        <div className="flex items-center gap-2">
          {getRoleBadge()}
          {currentAgency && (
            <span className="text-xs text-muted-foreground">
              @ {currentAgency.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Header Actions Component  
function HeaderActions() {
  const refreshData = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={refreshData}>
        <Activity className="h-4 w-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  );
}

function LayoutContent({ children }: ClientLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  
  // Pages that should not show the sidebar
  const noSidebarPages = ['/login', '/signup'];
  const shouldShowSidebar = isAuthenticated && !noSidebarPages.includes(pathname);
  
  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <UserHeader />
              </div>
              <HeaderActions />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-6 pt-2">
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
      <AuthProvider>
        <LayoutContent>
          {children}
        </LayoutContent>
      </AuthProvider>
    </ThemeProvider>
  );
}