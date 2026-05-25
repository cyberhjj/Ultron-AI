import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/AppSidebar";

export const metadata: Metadata = {
  title: "Ultron - AI Pentesting Assistant",
  description: "Advanced AI-powered penetration testing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ConvexClientProvider>
          <TooltipProvider>
            <SidebarProvider>
              <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <main className="flex-1 flex flex-col overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 md:hidden">
                    <SidebarTrigger />
                  </div>
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
