import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceProvider } from "@/context/workspace-store";
import "./globals.css";

/* Tipografia do Design System (Paper · "02 · Hierarquia Tipográfica") */
const display = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "LifePilot AI",
    template: "%s · LifePilot AI",
  },
  description:
    "Planejamento pessoal e mudança de casa assistida por IA.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <WorkspaceProvider>
            <div className="flex min-h-dvh w-full bg-canvas text-sm leading-4 antialiased">
              <AppSidebar />
              <div className="flex min-w-0 grow basis-0 flex-col">
                {children}
              </div>
            </div>
          </WorkspaceProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
