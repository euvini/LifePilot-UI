import type { Metadata } from "next"

import { NewPlanWizard } from "@/components/plans/new-plan-wizard"

export const metadata: Metadata = {
  title: "Novo Plano · Revisão de Sugestões IA",
}

export default function NovoPlanoRevisaoPage() {
  return <NewPlanWizard initialStep={2} />
}
