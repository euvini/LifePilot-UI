import { Suspense } from "react"
import type { Metadata } from "next"

import { NewPlanWizard } from "@/components/plans/new-plan-wizard"

export const metadata: Metadata = {
  title: "Novo Plano · Revisão de Sugestões IA",
}

export default function NovoPlanoRevisaoPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando revisão...</div>}>
      <NewPlanWizard initialStep={2} />
    </Suspense>
  )
}
