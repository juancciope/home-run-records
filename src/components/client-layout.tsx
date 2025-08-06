"use client"

import { ArtistProvider } from "@/contexts/artist-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
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
        {children}
      </ArtistProvider>
    </ThemeProvider>
  );
}