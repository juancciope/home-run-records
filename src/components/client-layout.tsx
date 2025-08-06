"use client"

import { ArtistProvider } from "@/contexts/artist-context";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ArtistProvider>
      {children}
    </ArtistProvider>
  );
}