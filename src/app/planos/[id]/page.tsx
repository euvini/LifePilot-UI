import { Suspense, use } from "react"
import type { Metadata } from "next"

import { WorkspaceClient } from "@/components/workspace/workspace-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: "Workspace & Copiloto IA · LifePilot",
    description: `Acompanhamento do plano de mudança ${id}`,
  }
}

function PlanoWorkspaceContent({ params }: PageProps) {
  const { id } = use(params)
  return <WorkspaceClient planId={id} />
}

export default function PlanoWorkspacePage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex grow items-center justify-center p-12 font-sans text-sm text-ink-muted">
          Carregando plano...
        </div>
      }
    >
      <PlanoWorkspaceContent params={params} />
    </Suspense>
  )
}
