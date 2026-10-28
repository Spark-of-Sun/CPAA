import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CPAA — Autonomous Personal AI Agent",
  description: "Connect WhatsApp, Gmail, Calendar & Slack into one seamless personal AI productivity assistant.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
