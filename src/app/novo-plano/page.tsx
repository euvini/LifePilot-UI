import type { Metadata } from "next"

import { NewPlanWizard } from "@/components/plans/new-plan-wizard"

export const metadata: Metadata = {
  title: "Novo Plano · Rota & Parâmetros IA",
}

export default function NovoPlanoPage() {
  return <NewPlanWizard initialStep={1} />
}
