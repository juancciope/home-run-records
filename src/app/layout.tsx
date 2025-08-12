import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-provider";
import { getUser } from "@/utils/auth";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user data server-side - this is safe and doesn't cause deadlocks
  const user = await getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
