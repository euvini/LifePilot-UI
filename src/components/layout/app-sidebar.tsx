"use client"

import Link from "next/link"
import { cn } from "cn"

import {
  BrandLogoIcon,
  SidebarPlanBoxIcon,
  SidebarPlanDocIcon,
  SidebarPlanHomeIcon,
} from "@/components/icons/duotone"
import { INITIAL_MOVING_PLANS, type MovingPlan } from "@/lib/mock-data"

export type QuickViewFilter = "all" | "in_progress" | "ai"

interface AppSidebarProps {
  plans?: MovingPlan[]
  activePlanId?: string
  onSelectPlan?: (planId: string) => void
  quickFilter?: QuickViewFilter
  onQuickFilterChange?: (filter: QuickViewFilter) => void
  totalTasksCount?: number
  inProgressCount?: number
  aiSuggestionsCount?: number
}

function PlanSidebarIcon({ type }: { type: MovingPlan["sidebarIcon"] }) {
  if (type === "home") {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-soft">
        <SidebarPlanHomeIcon />
      </div>
    )
  }
  if (type === "doc") {
    return <SidebarPlanDocIcon />
  }
  return <SidebarPlanBoxIcon />
}

export function AppSidebar({
  plans = INITIAL_MOVING_PLANS,
  activePlanId = "mp-lisboa-302",
  onSelectPlan,
  quickFilter = "all",
  onQuickFilterChange,
  totalTasksCount,
  inProgressCount,
  aiSuggestionsCount,
}: AppSidebarProps) {
  const activePlan =
    plans.find((p) => p.id === activePlanId) ?? plans[0]

  const allCount = totalTasksCount ?? activePlan.totalTasks
  const activeCount = inProgressCount ?? activePlan.inProgressTasks
  const suggestionsCount =
    aiSuggestionsCount ?? activePlan.copilotSuggestions.length

  return (
    <aside className="flex w-72 shrink-0 flex-col justify-between gap-6 border-r border-border bg-surface-subtle px-5 py-7">
      <div className="flex flex-col gap-6">
        {/* Cabeçalho da marca */}
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border-[1.8px] border-primary bg-primary-soft">
              <BrandLogoIcon />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg/md font-extrabold tracking-[-0.02em] text-ink">
                LifePilot AI
              </span>
              <span className="font-mono text-xs/xs text-ink-secondary">
                Relocation Copilot
              </span>
            </div>
          </Link>
          <span
            title="API Online"
            className="size-2.5 shrink-0 rounded-full border-[1.5px] border-primary bg-icon-mint"
          />
        </div>

        {/* Lista de planos */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1.5">
            <span className="font-mono text-xs/xs font-bold text-ink-secondary uppercase">
              MEUS PLANOS ({plans.length})
            </span>
            <span className="font-mono text-xs/xs text-ink-muted">
              /moving-plans
            </span>
          </div>

          {plans.map((plan) => {
            const isActive = plan.id === activePlan.id
            const content = (
              <>
                <PlanSidebarIcon type={plan.sidebarIcon} />
                <div className="flex grow basis-0 flex-col gap-0.5 text-left">
                  <span
                    className={cn(
                      "font-sans text-[13px] leading-[17px] font-bold",
                      isActive ? "text-icon-mint" : "text-ink"
                    )}
                  >
                    {plan.sidebarTitle}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs/xs",
                      isActive ? "text-primary-soft" : "text-ink-secondary"
                    )}
                  >
                    {plan.movingDate} · {plan.progress}%
                  </span>
                </div>
              </>
            )

            const itemClasses = cn(
              "flex w-full items-center gap-3 px-3.5 py-3 transition-colors",
              isActive
                ? "rounded-[16px] bg-primary"
                : "rounded-full bg-surface hover:bg-surface/80"
            )

            if (onSelectPlan) {
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={itemClasses}
                >
                  {content}
                </button>
              )
            }

            return (
              <Link
                key={plan.id}
                href={`/?plan=${plan.id}`}
                className={itemClasses}
              >
                {content}
              </Link>
            )
          })}
        </div>

        {/* Visões rápidas */}
        <div className="flex flex-col gap-2 border-t border-border pt-2">
          <div className="px-1.5">
            <span className="font-mono text-xs/xs font-bold text-ink-secondary uppercase">
              VISÕES RÁPIDAS
            </span>
          </div>

          <button
            type="button"
            onClick={() => onQuickFilterChange?.("all")}
            className={cn(
              "flex items-center justify-between rounded-full border-[1.5px] border-ink bg-surface px-4 py-2.5 transition-transform",
              quickFilter === "all" && "ring-2 ring-ink/15"
            )}
          >
            <span className="font-sans text-[13px] leading-sm font-bold text-ink">
              Todas as Tarefas
            </span>
            <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-xs/xs font-bold text-ink">
              {allCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onQuickFilterChange?.("in_progress")}
            className={cn(
              "flex items-center justify-between rounded-full border-[1.5px] border-danger bg-danger-soft px-4 py-2.5 transition-transform",
              quickFilter === "in_progress" && "ring-2 ring-danger/20"
            )}
          >
            <span className="font-sans text-[13px] leading-sm font-bold text-danger">
              Em Andamento
            </span>
            <span className="rounded-full bg-pink-main px-2 py-0.5 font-mono text-xs/xs font-bold text-danger">
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onQuickFilterChange?.("ai")}
            className={cn(
              "flex items-center justify-between rounded-full border-[1.5px] border-purple-stroke bg-accent-ai-soft px-4 py-2.5 transition-transform",
              quickFilter === "ai" && "ring-2 ring-accent-ai/30"
            )}
          >
            <span className="font-sans text-[13px] leading-sm font-bold text-purple-stroke">
              Sugestões da IA
            </span>
            <span className="rounded-full bg-accent-ai px-2 py-0.5 font-mono text-xs/xs font-bold text-purple-stroke">
              {suggestionsCount} novas
            </span>
          </button>
        </div>
      </div>

      {/* Rodapé: Countdown + Botão Novo Plano */}
      <div className="flex flex-col gap-3.5 border-t border-border pt-4">
        <div className="flex flex-col gap-2 rounded-[16px] border-[1.5px] border-border bg-surface-subtle p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs/xs font-bold tracking-[0.05em] text-ink-secondary uppercase">
              Countdown da Mudança
            </span>
            <span className="shrink-0 rounded-full border-[1.5px] border-primary bg-icon-mint px-2 py-0.5 font-mono text-xs/xs font-bold text-primary">
              {activePlan.daysRemaining} DIAS
            </span>
          </div>
          <span className="font-sans text-[13px] leading-sm font-bold text-ink">
            {activePlan.shortRoute}
          </span>
          <div className="flex h-2 w-full shrink-0 overflow-clip rounded-full border-[1.5px] border-primary bg-surface">
            <div
              className="h-full bg-icon-mint transition-all"
              style={{ width: `${activePlan.progress}%` }}
            />
          </div>
        </div>

        <Link
          href="/novo-plano"
          className="flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-full border-[1.8px] border-primary bg-primary transition-colors hover:bg-primary-strong"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <circle cx="9" cy="9" r="7.5" fill="var(--color-icon-mint)" />
            <path
              d="M9 5.5V12.5M5.5 9H12.5"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-sans text-base/sm font-bold text-icon-mint">
            Novo Plano de Mudança
          </span>
        </Link>

        <Link
          href="/design-system"
          className="text-center font-mono text-xs/xs text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Ver Design System v1.0 →
        </Link>
      </div>
    </aside>
  )
}
