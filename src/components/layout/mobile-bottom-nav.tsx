"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CheckSquare, Home, PlusCircle, Sparkles } from "lucide-react"
import { cn } from "cn"

import { useWorkspaceStore } from "@/context/workspace-store"

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { activePlan, plans, setQuickFilter } = useWorkspaceStore()

  // Oculta a barra de navegação nas rotas do wizard (que têm seu próprio sticky action footer)
  // e nas páginas isoladas de design-system e autenticação
  if (
    pathname?.startsWith("/novo-plano") ||
    pathname?.startsWith("/design-system") ||
    pathname === "/login" ||
    pathname === "/cadastro"
  ) {
    return null
  }

  const currentPlanId = activePlan?.id || plans[0]?.id

  const isHomeActive = pathname === "/"
  const isTasksActive =
    Boolean(pathname?.startsWith("/planos")) && !pathname?.includes("#copilot")
  const isNewPlanActive = pathname?.startsWith("/novo-plano")

  function handleCopilotClick() {
    setQuickFilter("ai")
    if (currentPlanId) {
      router.push(`/planos/${currentPlanId}`)
    }
  }

  return (
    <nav
      aria-label="Navegação Mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col border-t border-border bg-surface px-5 pt-[10px] pb-2 tablet:hidden"
    >
      <div className="flex w-full items-center justify-around">
        {/* 1. Planos / Início */}
        <Link
          href="/"
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <Home
            className={cn(
              "size-5 transition-colors",
              isHomeActive ? "text-primary" : "text-ink-muted"
            )}
            strokeWidth={isHomeActive ? 2.5 : 2}
          />
          <span
            className={cn(
              "font-sans text-[10px] leading-3 transition-colors",
              isHomeActive ? "font-bold text-primary" : "font-medium text-ink-muted"
            )}
          >
            Planos
          </span>
        </Link>

        {/* 2. Tarefas */}
        <Link
          href={currentPlanId ? `/planos/${currentPlanId}` : "/novo-plano"}
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <CheckSquare
            className={cn(
              "size-5 transition-colors",
              isTasksActive ? "text-primary" : "text-ink-muted"
            )}
            strokeWidth={isTasksActive ? 2.5 : 2}
          />
          <span
            className={cn(
              "font-sans text-[10px] leading-3 transition-colors",
              isTasksActive
                ? "font-bold text-primary"
                : "font-medium text-ink-muted"
            )}
          >
            Tarefas
          </span>
        </Link>

        {/* 3. Copiloto */}
        <button
          type="button"
          onClick={handleCopilotClick}
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <Sparkles
            className="size-5 text-accent-ai"
            strokeWidth={2.2}
          />
          <span className="font-sans text-[10px] font-bold leading-3 text-accent-ai">
            Copiloto
          </span>
        </button>

        {/* 4. Novo Plano */}
        <Link
          href="/novo-plano"
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
        >
          <PlusCircle
            className={cn(
              "size-5 transition-colors",
              isNewPlanActive ? "text-primary" : "text-ink-muted"
            )}
            strokeWidth={isNewPlanActive ? 2.5 : 2}
          />
          <span
            className={cn(
              "font-sans text-[10px] leading-3 transition-colors",
              isNewPlanActive
                ? "font-bold text-primary"
                : "font-medium text-ink-muted"
            )}
          >
            Novo
          </span>
        </Link>
      </div>

      {/* Indicador de barra de início iOS (Paper 1IF-0: 134x5) */}
      <div className="mx-auto mt-2.5 mb-0.5 h-[5px] w-[134px] shrink-0 rounded-full bg-ink/25" />
    </nav>
  )
}
