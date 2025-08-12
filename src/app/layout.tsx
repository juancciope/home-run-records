import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-provider";
import { getUserWithProfile } from "@/lib/auth/server-auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artist OS - Artist Management Platform",
  description: "Professional platform for music artists and agencies to track performance and grow their audience",
};

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user and profile data server-side for initial auth state
  const authData = await getUserWithProfile()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider 
          initialUser={authData?.user ?? null}
          initialProfile={authData?.profile ?? null}
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
