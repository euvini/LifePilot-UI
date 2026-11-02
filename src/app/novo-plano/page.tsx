import { Suspense } from "react"
import type { Metadata } from "next"

import { NewPlanWizard } from "@/components/plans/new-plan-wizard"

export const metadata: Metadata = {
  title: "Novo Plano · Rota & Parâmetros IA",
}

export default function NovoPlanoPage() {
  return (
    <Suspense fallback={<div className="p-8">Carregando formulário...</div>}>
      <NewPlanWizard initialStep={1} />
    </Suspense>
  )
}
