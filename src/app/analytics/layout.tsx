"use client"

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// User Header Component
function UserHeader() {
  const { user, profile, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        <div>
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted animate-pulse rounded mt-1" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : user.email?.split('@')[0] || "User";

  const getRoleBadge = () => {
    if (profile?.global_role === 'superadmin') {
      return (
        <Badge variant="default" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs">
          Super Admin
        </Badge>
      );
    }
    if (profile?.global_role === 'artist_manager') {
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
        <AvatarImage src={profile?.avatar_url} alt={displayName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
        <div className="flex items-center gap-2">
          {getRoleBadge()}
        </div>
      </div>
    </div>
  );
}

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
          <header className="flex h-20 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between w-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <UserHeader />
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