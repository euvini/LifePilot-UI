"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Plus, Truck } from "lucide-react"
import { cn } from "cn"

import { useWorkspaceStore } from "@/context/workspace-store"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function MobileHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { plans, activePlan, selectPlan, isOnline, isSyncing } =
    useWorkspaceStore()

  const [open, setOpen] = React.useState(false)

  // Nome curto de exibição no botão seletor de planos
  const activePlanLabel = React.useMemo(() => {
    if (!activePlan) return "Planos"
    const dest = activePlan.destination.split(",")[0]?.trim()
    return dest || activePlan.sidebarTitle.slice(0, 10)
  }, [activePlan])

  // Oculta o header genérico nas telas de wizard que possuem seu próprio App Bar nativo
  if (pathname?.startsWith("/novo-plano")) {
    return null
  }

  function handleSelect(planId: string) {
    selectPlan(planId)
    setOpen(false)
    router.push(`/planos/${planId}`)
  }

  return (
    <header className="flex w-full items-center justify-between bg-canvas px-5 pt-3 pb-2 tablet:hidden">
      {/* Lado Esquerdo: Logo & Marca (Paper Artboard 1FL-0) */}
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-primary-strong bg-icon-mint">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
              fill="none"
              stroke="var(--color-primary-strong)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="9 22 9 12 15 12 15 22"
              fill="none"
              stroke="var(--color-primary-strong)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-display text-md/base font-extrabold text-ink">
            LifePilot AI
          </span>
          <span className="font-mono text-[10px] leading-3 text-ink-muted">
            Relocation Copilot
          </span>
        </div>
      </Link>

      {/* Lado Direito: Seletor de Planos + Status Dot */}
      <div className="flex items-center gap-2">
        {/* Status Dot */}
        <span
          title={isOnline ? (isSyncing ? "Sincronizando..." : "API Online") : "Modo Offline"}
          className={cn(
            "size-2 shrink-0 rounded-full border border-border transition-colors",
            isOnline
              ? isSyncing
                ? "animate-pulse bg-accent-ai"
                : "bg-icon-mint"
              : "bg-danger"
          )}
        />

        {/* Dropdown Seletor de Plano */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-[8px] border border-border bg-surface px-2.5 py-1.5 font-sans text-xs/xs font-semibold text-ink transition-colors hover:bg-surface-subtle"
            >
              <span className="max-w-[80px] truncate">{activePlanLabel}</span>
              <ChevronDown className="size-3 text-ink-muted" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-2">
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 font-mono text-[10px] font-bold text-ink-secondary uppercase">
                Meus Planos ({plans.length})
              </span>
              {plans.length === 0 ? (
                <div className="p-3 text-center font-sans text-xs text-ink-muted">
                  Nenhum plano cadastrado.
                </div>
              ) : (
                plans.map((p) => {
                  const isSelected = p.id === activePlan?.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-sans text-xs transition-colors",
                        isSelected
                          ? "bg-primary font-bold text-icon-mint"
                          : "text-ink hover:bg-surface-subtle"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Truck className="size-3.5 shrink-0" />
                        <span className="truncate">{p.sidebarTitle}</span>
                      </div>
                      <span className="shrink-0 font-mono text-[10px]">
                        {p.progress}%
                      </span>
                    </button>
                  )
                })
              )}

              <div className="mt-1 border-t border-border pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    router.push("/novo-plano")
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 font-sans text-xs font-semibold text-primary transition-colors hover:bg-primary-soft"
                >
                  <Plus className="size-3.5" />
                  <span>Cadastrar Novo Plano</span>
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
