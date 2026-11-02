import type { Metadata } from "next"

import { DashboardView } from "@/components/dashboard/dashboard-view"

export const metadata: Metadata = {
  title: "Dashboard · LifePilot AI",
  description:
    "Visão geral dos seus planos de mudança, cronômetro de dias restantes, checklist inteligente e Copiloto de IA.",
}

export default function HomePage() {
  return <DashboardView />
}
