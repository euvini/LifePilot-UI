"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react"
import { cn } from "cn"

import {
  AlertCircleIcon,
  CopilotCupIcon,
  CopilotSparkleBadgeIcon,
  HeroHouseCheckIcon,
  ShieldClockIcon,
  StatusActiveClockIcon,
  StatusDoneCircleIcon,
  StatusTodoDotIcon,
  SuggestionCheckCircleIcon,
  TaskBoxIcon,
  TaskCircleCheckIcon,
  TaskDocCheckIcon,
  TaskInspectIcon,
  TaskKeyIcon,
  TaskTruckIcon,
  TrashIcon,
} from "@/components/icons/duotone"
import { DeletePlanDialog } from "@/components/plans/delete-plan-dialog"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useWorkspaceStore } from "@/context/workspace-store"
import type { TaskIconKey, TaskStatus } from "@/types/plan"

function TaskCategoryIcon({
  icon,
  status,
}: {
  icon: TaskIconKey
  status: TaskStatus
}) {
  const tone =
    status === "DONE" ? "green" : status === "IN_PROGRESS" ? "pink" : "neutral"
  switch (icon) {
    case "doc-check":
      return <TaskDocCheckIcon tone={tone} />
    case "circle-check":
      return <TaskCircleCheckIcon tone={tone} />
    case "truck":
      return <TaskTruckIcon tone={tone} />
    case "box":
      return <TaskBoxIcon tone={tone} />
    case "key":
      return <TaskKeyIcon tone={tone} />
    case "inspect":
    default:
      return <TaskInspectIcon tone={tone} />
  }
}

export function WorkspaceClient({ planId }: { planId?: string } = {}) {
  const router = useRouter()
  const {
    activePlan,
    isLoadingPlans,
    quickFilter,
    checklistTab,
    isGeneratingAi,
    lastAiError,
    clearAiError,
    selectPlan,
    setQuickFilter,
    setChecklistTab,
    cycleTaskStatus,
    addQuickTask,
    deleteTask,
    toggleSuggestion,
    acceptSuggestionsBatch,
    discardSuggestions,
    generateAiSuggestions,
  } = useWorkspaceStore()

  // Sincroniza plano via parâmetro de rota se fornecido
  React.useEffect(() => {
    if (planId && activePlan?.id !== planId) {
      selectPlan(planId)
    }
  }, [planId, activePlan?.id, selectPlan])

  const [newTaskTitle, setNewTaskTitle] = React.useState("")
  const [customTaskDate, setCustomTaskDate] = React.useState<string | null>(null)
  const newTaskDate = customTaskDate ?? activePlan?.movingDate ?? "2026-12-15"
  const newTaskInputRef = React.useRef<HTMLInputElement>(null)
  const [mobileCopilotOpen, setMobileCopilotOpen] = React.useState(false)

  const pendingTasksCount =
    (activePlan?.inProgressTasks ?? 0) + (activePlan?.todoTasks ?? 0)

  const visibleTasks = React.useMemo(() => {
    if (!activePlan) return []
    let list = activePlan.tasks
    if (checklistTab === "pending") {
      list = list.filter((t) => t.status !== "DONE")
    }
    if (quickFilter === "in_progress") {
      list = list.filter((t) => t.status === "IN_PROGRESS")
    }
    return list
  }, [activePlan, checklistTab, quickFilter])

  const selectedSuggestions = React.useMemo(() => {
    return activePlan?.copilotSuggestions.filter((s) => s.selected) ?? []
  }, [activePlan?.copilotSuggestions])

  async function handleAddQuickTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      newTaskInputRef.current?.focus()
      return
    }
    const added = await addQuickTask(newTaskTitle, newTaskDate)
    if (added) {
      setNewTaskTitle("")
      setCustomTaskDate(null)
    }
  }

  // Estado de Carregamento Inicial
  if (isLoadingPlans && !activePlan) {
    return (
      <main className="flex grow items-center justify-center bg-canvas p-12">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <span className="font-sans text-sm font-semibold text-ink-muted">
            Carregando workspace do plano...
          </span>
        </div>
      </main>
    )
  }

  // Estado Vazio (Sem planos cadastrados)
  if (!activePlan) {
    return (
      <main className="flex grow flex-col items-center justify-center gap-6 bg-canvas p-8 text-center tablet:p-12">
        <div className="flex size-16 items-center justify-center rounded-2xl border-[1.8px] border-primary bg-primary-soft">
          <HeroHouseCheckIcon />
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <h2 className="font-display text-2xl font-bold text-ink">
            Nenhum plano encontrado
          </h2>
          <p className="font-sans text-sm text-ink-muted">
            Você ainda não possui planos de mudança cadastrados ou o plano selecionado não existe.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar ao Dashboard
          </Button>
          <Button variant="default" onClick={() => router.push("/novo-plano")}>
            <Plus className="mr-2 size-4 text-icon-mint" />
            Criar Novo Plano
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex grow basis-0 flex-col gap-4 bg-canvas px-4 py-4 tablet:gap-6 tablet:px-6 tablet:py-8 desktop:px-9">
      {/* Topbar Desktop: Breadcrumb + Gatilhos (Paper desktop layout) */}
      <header className="hidden w-full flex-wrap items-center justify-between gap-4 tablet:flex">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            className="font-sans text-[13px] leading-sm font-semibold text-ink-muted hover:text-ink"
          >
            Dashboard
          </Link>
          <span className="font-sans text-[13px] leading-sm font-semibold text-ink-muted">
            /
          </span>
          <span className="font-sans text-[13px] leading-sm font-bold text-ink">
            {activePlan.title.replace(/\.$/, "")}
          </span>
          <div className="flex items-center gap-1.5 rounded-full border-[1.5px] border-border bg-surface px-2.5 py-1">
            <span className="size-[7px] shrink-0 rounded-full bg-primary" />
            <span className="font-mono text-xs/xs font-semibold text-primary">
              GET /moving-plans/:id
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ai"
            onClick={() => generateAiSuggestions()}
            disabled={isGeneratingAi}
            className="h-[42px] gap-2 px-[18px] text-[13px] leading-sm"
          >
            <Sparkles className="size-4 text-accent-ai" />
            {isGeneratingAi ? "IA Gerando..." : "Gerar Sugestões com IA"}
          </Button>

          <Button
            variant="outline"
            onClick={() => newTaskInputRef.current?.focus()}
            className="h-[42px] gap-2 px-[18px] text-[13px] leading-sm"
          >
            <Plus className="size-4 text-ink" />
            Nova Tarefa Manual
          </Button>

          <DeletePlanDialog
            planId={activePlan.id}
            planTitle={activePlan.title}
            onDeleted={() => router.push("/")}
            trigger={
              <Button
                variant="destructive"
                className="h-[42px] gap-2 px-3.5 text-[13px] leading-sm"
                title="Excluir este plano de mudança"
              >
                <Trash2 className="size-4" />
                <span className="hidden tablet:inline">Excluir Plano</span>
              </Button>
            }
          />
        </div>
      </header>

      {/* Banner de Resiliência da IA (Paper E3-0: HTTP 429 / HTTP 503/504) */}
      {lastAiError && (
        <div className="w-full">
          {lastAiError.isThrottled ? (
            <Alert variant="ai">
              <ShieldClockIcon />
              <AlertTitle>
                Limite de requisições excedido. Tente novamente em instantes.
              </AlertTitle>
              <AlertDescription>
                Proteção Throttler (máx. 5 gerações de IA/min por IP). Operações
                CRUD continuam livres.
              </AlertDescription>
              <AlertAction>
                <button
                  type="button"
                  onClick={clearAiError}
                  className="rounded-full border-[1.5px] border-purple-stroke bg-surface px-3 py-1 font-mono text-xs/xs font-bold text-purple-stroke hover:bg-surface-subtle"
                >
                  HTTP 429 · FECHAR
                </button>
              </AlertAction>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>
                Serviço de IA temporariamente indisponível ou tempo esgotado (15s)
              </AlertTitle>
              <AlertDescription>
                Isolamento garantido: nenhuma sugestão parcial foi persistida no
                banco PostgreSQL.
              </AlertDescription>
              <AlertAction>
                <button
                  type="button"
                  onClick={clearAiError}
                  className="rounded-full border-[1.5px] border-danger bg-surface px-3 py-1 font-mono text-xs/xs font-bold text-danger hover:bg-surface-subtle"
                >
                  HTTP 503 / 504 · FECHAR
                </button>
              </AlertAction>
            </Alert>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         MOBILE PLAN HERO CARD (Paper 1G0-0)
         390px mobile layout strictly matching Paper 1G0-0
         ═══════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-3 rounded-[18px] bg-primary p-4 tablet:hidden">
        {/* Topo do Card: Pill PLANO ATIVO + Faltam X dias + Data Limite */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-block rounded-[4px] bg-primary-strong px-[6px] py-[3px]">
              <span className="font-mono text-[9px] font-bold leading-3 text-icon-mint">
                PLANO ATIVO
              </span>
            </div>
            <span className="font-sans text-xs/xs text-border">
              Faltam {activePlan.daysRemaining} dias
            </span>
          </div>
          <span className="font-mono text-[10px] leading-3 text-[#A1D490]">
            {activePlan.movingDate}
          </span>
        </div>

        {/* Título e Rota */}
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[18px] font-bold leading-[22px] tracking-[-0.01em] text-white">
            {activePlan.title}
          </h1>
          <p className="font-sans text-sm leading-4 text-border">
            {activePlan.origin} → {activePlan.destination}
          </p>
        </div>

        {/* Barra e Progresso de Tarefas (Divisor com borda verde) */}
        <div className="flex flex-col gap-[6px] border-t border-success pt-[6px]">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs/xs text-border">
              {activePlan.completedTasks} de {activePlan.totalTasks} concluídas
            </span>
            <span className="font-mono text-[13px] font-bold leading-4 text-icon-mint">
              {activePlan.progress}%
            </span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-full bg-primary-strong">
            <div
              className="h-full rounded-full bg-icon-mint transition-all"
              style={{ width: `${activePlan.progress}%` }}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         MOBILE COPILOT PILL CARD (Paper 1GH-0)
         Visible on mobile directly below hero
         ═══════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col gap-2 tablet:hidden">
        <div className="flex items-center justify-between rounded-lg border-[1.5px] border-accent-ai bg-accent-ai-soft px-[14px] py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-[28px] shrink-0 items-center justify-center rounded-[8px] bg-white">
              <Sparkles className="size-4 text-accent-ai" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-[13px] font-bold leading-4 text-purple-stroke">
                Copiloto IA
              </span>
              <span className="font-sans text-xs/xs text-[#351C75]">
                {activePlan.copilotSuggestions.length > 0
                  ? `${activePlan.copilotSuggestions.length} novas sugestões em memória`
                  : "Nenhuma sugestão em memória"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activePlan.copilotSuggestions.length > 0 ? (
              <button
                type="button"
                onClick={() => setMobileCopilotOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded-[8px] bg-accent-ai px-2.5 py-1.5 font-sans text-xs/xs font-bold text-white shadow-xs transition-opacity hover:opacity-90"
              >
                <span>Revisar</span>
                {mobileCopilotOpen ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => generateAiSuggestions()}
                disabled={isGeneratingAi}
                className="rounded-[8px] bg-accent-ai px-2.5 py-1.5 font-sans text-xs/xs font-bold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isGeneratingAi ? "Gerando..." : "Gerar"}
              </button>
            )}
          </div>
        </div>

        {/* Expansão das Sugestões no Mobile quando clica "Revisar" */}
        {mobileCopilotOpen && activePlan.copilotSuggestions.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-purple-stroke bg-surface p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-purple-stroke uppercase">
                Sugestões IA ({activePlan.copilotSuggestions.length})
              </span>
              <span className="font-sans text-xs/xs text-ink-muted">
                {selectedSuggestions.length} selecionadas
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {activePlan.copilotSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSuggestion(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border border-purple-stroke/50 bg-accent-ai-soft/40 p-2.5 text-left transition-opacity",
                    !item.selected && "opacity-50"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm",
                        item.selected
                          ? "bg-accent-ai text-white"
                          : "border border-purple-stroke bg-white"
                      )}
                    >
                      {item.selected && <Check className="size-3" strokeWidth={3} />}
                    </div>
                    <span className="truncate font-sans text-xs font-semibold text-ink">
                      {item.title}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] font-bold text-purple-stroke">
                    {item.dueDate}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={discardSuggestions}
                className="rounded-md border border-border px-3 py-1.5 font-sans text-xs font-semibold text-ink-muted hover:bg-surface-subtle"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={() => {
                  acceptSuggestionsBatch()
                  setMobileCopilotOpen(false)
                }}
                disabled={selectedSuggestions.length === 0}
                className="grow rounded-md bg-accent-ai px-3 py-1.5 font-sans text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Aceitar ({selectedSuggestions.length})
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         DESKTOP PLAN HERO CARD
         Hidden on mobile (< tablet)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="hidden w-full flex-col justify-between gap-7 rounded-2xl bg-primary px-7 py-6 tablet:flex desktop:flex-row desktop:items-center">
        <div className="flex grow basis-0 items-center gap-6">
          <div className="flex size-[120px] shrink-0 items-center justify-center rounded-xl bg-primary-soft">
            <HeroHouseCheckIcon />
          </div>
          <div className="flex grow basis-0 flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-icon-mint px-2.5 py-1 font-mono text-xs/xs font-bold text-primary">
                PLANO ATIVO · MOVING DATE: {activePlan.movingDate}
              </span>
              <span className="font-sans text-sm leading-4 font-semibold text-primary-soft">
                Faltam {activePlan.daysRemaining} dias para a mudança
              </span>
            </div>

            <h1 className="font-display text-[34px] leading-[38px] font-extrabold tracking-[-0.03em] text-icon-mint">
              {activePlan.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-sans text-[13px] leading-sm font-semibold text-surface">
                Origem: {activePlan.origin}
              </span>
              <span className="font-sans text-[13px] leading-sm font-bold text-icon-mint">
                →
              </span>
              <span className="font-sans text-[13px] leading-sm font-semibold text-surface">
                Destino: {activePlan.destination}
              </span>
            </div>
          </div>
        </div>

        {/* Widget de Progresso Geral */}
        <div className="flex w-full shrink-0 flex-col items-end justify-between gap-3.5 rounded-[18px] border-[1.5px] border-success bg-primary-strong px-5 py-4 desktop:w-[250px]">
          <div className="flex w-full items-baseline justify-between">
            <span className="font-sans text-sm leading-4 font-semibold text-primary-soft">
              Progresso Geral
            </span>
            <span className="font-display text-xl leading-[30px] font-extrabold text-icon-mint">
              {activePlan.progress}%
            </span>
          </div>
          <div className="flex h-2.5 w-full shrink-0 overflow-clip rounded-full bg-primary">
            <div
              className="h-full rounded-full bg-icon-mint transition-all"
              style={{ width: `${activePlan.progress}%` }}
            />
          </div>
          <div className="flex w-full items-center justify-between">
            <span className="font-mono text-xs/xs font-medium text-surface">
              {activePlan.completedTasks} de {activePlan.totalTasks} concluídas
            </span>
            <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-icon-mint">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"
                  fill="none"
                  stroke="var(--color-icon-mint)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         CHECKLIST CONTAINER (Mobile Paper 1GS-0 & Desktop)
         ═══════════════════════════════════════════════════════════════ */}
      <div className="flex w-full grow basis-0 flex-col items-start gap-4 tablet:gap-6 desktop:flex-row">
        {/* Coluna Esquerda: Checklist de Tarefas */}
        <section className="flex w-full grow basis-0 flex-col gap-3.5 rounded-[18px] border border-border bg-surface p-4 shadow-xs tablet:rounded-2xl tablet:bg-surface-subtle tablet:p-6">
          <div className="flex w-full items-center justify-between pb-1">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-display text-md/base font-bold text-ink tablet:text-[24px] tablet:leading-[28px] tablet:font-extrabold">
                Checklist de Tarefas
              </h2>
              <p className="hidden font-sans text-sm leading-4 font-semibold text-ink-secondary tablet:block">
                Ordenadas por prazo limite · Validação automática dueDate ≤{" "}
                {activePlan.movingDate}
              </p>
            </div>

            {/* Segmented Filter: Todas / Pendentes (Paper 1GT-0) */}
            <div className="flex shrink-0 items-center gap-[6px]">
              <button
                type="button"
                onClick={() => {
                  setChecklistTab("all")
                  setQuickFilter("all")
                }}
                className={cn(
                  "rounded-full px-2.5 py-[3px] font-sans text-[10px] font-bold transition-colors tablet:px-3 tablet:py-[5px] tablet:text-xs/xs",
                  checklistTab === "all"
                    ? "bg-ink text-white"
                    : "bg-surface-subtle text-ink-muted hover:text-ink"
                )}
              >
                Todas ({activePlan.totalTasks})
              </button>
              <button
                type="button"
                onClick={() => setChecklistTab("pending")}
                className={cn(
                  "rounded-full px-2.5 py-[3px] font-sans text-[10px] font-semibold transition-colors tablet:px-2.5 tablet:py-[5px] tablet:text-xs/xs",
                  checklistTab === "pending"
                    ? "bg-ink font-bold text-white"
                    : "bg-surface-subtle text-ink-muted hover:text-ink"
                )}
              >
                Pendentes ({pendingTasksCount})
              </button>
            </div>
          </div>

          {/* Quick-Add Task Bar */}
          <form
            onSubmit={handleAddQuickTask}
            className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-ink-muted bg-canvas p-2 focus-within:border-solid focus-within:border-primary tablet:rounded-full tablet:border-[1.5px] tablet:py-2 tablet:pr-2.5 tablet:pl-[18px]"
          >
            <div className="flex grow basis-0 items-center gap-2">
              <Plus className="size-4 shrink-0 text-ink-muted" />
              <input
                ref={newTaskInputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                maxLength={200}
                placeholder="Adicionar tarefa rápida..."
                className="w-full bg-transparent font-sans text-xs font-medium text-ink outline-none placeholder:text-ink-muted tablet:text-[13px] tablet:leading-sm"
              />
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <DatePicker
                variant="pill"
                align="end"
                value={newTaskDate}
                maxDate={activePlan.movingDate}
                invalid={newTaskDate > activePlan.movingDate}
                onChange={setCustomTaskDate}
                ariaLabel="Prazo da nova tarefa"
              />
              <button
                type="submit"
                className="rounded-full bg-primary px-3 py-1 font-sans text-xs font-bold text-icon-mint transition-colors hover:bg-primary-strong tablet:px-3.5 tablet:py-[7px] tablet:text-sm"
              >
                Adicionar
              </button>
            </div>
          </form>

          {/* Lista de Tarefas (Strict Paper 1H0-0 on mobile & pills on desktop) */}
          <div className="flex flex-col gap-2 tablet:gap-3">
            {visibleTasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center">
                <span className="font-sans text-xs text-ink-muted tablet:text-sm">
                  Nenhuma tarefa encontrada neste filtro.
                </span>
              </div>
            ) : (
              visibleTasks.map((task) => {
                const badgeVariant =
                  task.status === "DONE"
                    ? "done"
                    : task.status === "IN_PROGRESS"
                      ? "in_progress"
                      : "todo"

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "group/task flex w-full items-center justify-between rounded-md border border-border bg-white px-3 py-[10px] transition-all tablet:rounded-full tablet:px-4 tablet:py-3",
                      task.highlighted && "border-[1.8px] border-ink"
                    )}
                  >
                    {/* Lado Esquerdo: Indicador 18x18 (Paper 1H1-0) + Título + Data */}
                    <div className="flex min-w-0 grow basis-0 items-center gap-2.5 tablet:gap-3.5">
                      {/* Mobile 18x18 Status Box (Paper) / Desktop Duotone Icon */}
                      <button
                        type="button"
                        onClick={() => cycleTaskStatus(task.id)}
                        title="Alternar status"
                        className="tablet:hidden"
                      >
                        {task.status === "DONE" ? (
                          <div className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-icon-mint">
                            <Check className="size-3 text-primary" strokeWidth={3} />
                          </div>
                        ) : task.status === "IN_PROGRESS" ? (
                          <div className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] bg-pink-main">
                            <Clock className="size-3 text-white" strokeWidth={2.5} />
                          </div>
                        ) : (
                          <div className="size-[18px] shrink-0 rounded-[5px] border-2 border-border-strong bg-surface" />
                        )}
                      </button>

                      {/* Desktop category icon */}
                      <div className="hidden tablet:block">
                        <TaskCategoryIcon icon={task.icon} status={task.status} />
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-sans text-xs font-bold text-ink tablet:text-base/sm">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-ink-muted tablet:hidden">
                            {task.dueDate}
                          </span>
                          <span
                            className={cn(
                              "hidden truncate font-sans text-sm leading-4 font-medium tablet:inline",
                              task.highlighted
                                ? "text-ink-secondary"
                                : "text-ink-muted"
                            )}
                          >
                            {task.description}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Prazo Desktop + Badge de Status + Delete */}
                    <div className="flex shrink-0 items-center gap-2 tablet:gap-2.5">
                      <span
                        className={cn(
                          "hidden w-[82px] shrink-0 text-right font-mono text-xs/xs font-semibold tablet:block",
                          task.highlighted ? "text-ink" : "text-ink-muted"
                        )}
                      >
                        {task.dueDate}
                      </span>

                      {/* Mobile Status Tag (Paper 1H1-0: 9px font) */}
                      <button
                        type="button"
                        title="Clique para alternar o status da tarefa"
                        onClick={() => cycleTaskStatus(task.id)}
                        className="tablet:hidden"
                      >
                        {task.status === "DONE" ? (
                          <span className="rounded-[4px] bg-primary-soft px-[6px] py-[2px] font-mono text-[9px] font-bold text-primary">
                            DONE
                          </span>
                        ) : task.status === "IN_PROGRESS" ? (
                          <span className="rounded-[4px] bg-danger-soft px-[6px] py-[2px] font-mono text-[9px] font-bold text-danger">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="rounded-[4px] bg-surface-subtle px-[6px] py-[2px] font-mono text-[9px] font-bold text-ink-muted">
                            TODO
                          </span>
                        )}
                      </button>

                      {/* Desktop Badge */}
                      <button
                        type="button"
                        title="Clique para alternar o status da tarefa"
                        onClick={() => cycleTaskStatus(task.id)}
                        className="hidden tablet:block"
                      >
                        <Badge
                          variant={badgeVariant}
                          appearance="solid"
                          className={cn(
                            "w-[110px] py-[5px]",
                            task.status === "TODO" && "bg-canvas"
                          )}
                        >
                          {task.status}
                        </Badge>
                      </button>

                      {/* Botão de Excluir Tarefa */}
                      <button
                        type="button"
                        title="Eliminar tarefa (HTTP 204)"
                        onClick={() => deleteTask(task.id)}
                        className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-all hover:bg-danger-soft hover:text-danger tablet:border tablet:border-border tablet:bg-surface tablet:opacity-0 tablet:group-hover/task:opacity-100"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Coluna Direita Desktop: Copiloto IA + Card Editorial + Distribuição de Status */}
        <aside className="hidden w-full shrink-0 flex-col gap-5 tablet:flex desktop:w-[440px]">
          {/* Card 1: Copiloto IA (Sugestões em Memória) */}
          <div className="flex w-full flex-col gap-4 rounded-2xl border-2 border-purple-stroke bg-accent-ai-soft p-6">
            <div className="flex w-full items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[16px] border-[1.8px] border-purple-stroke bg-surface">
                  <CopilotSparkleBadgeIcon />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-display text-[22px] leading-[26px] font-extrabold tracking-[-0.02em] text-purple-stroke">
                    Copiloto IA.
                  </h3>
                  <p className="font-sans text-sm leading-4 font-semibold text-purple-stroke">
                    {activePlan.copilotSuggestions.length} sugestões em memória
                    (não salvas)
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-purple-stroke px-2 py-1 font-mono text-[10px] leading-xs font-bold text-surface">
                PREVIEW · 5/min
              </span>
            </div>

            {activePlan.copilotSuggestions.length > 0 ? (
              <div className="flex w-full flex-col gap-2.5">
                {activePlan.copilotSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSuggestion(item.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2.5 rounded-full border-[1.8px] border-purple-stroke bg-surface px-3.5 py-[11px] text-left transition-opacity",
                      !item.selected && "opacity-60"
                    )}
                  >
                    <div className="flex grow basis-0 items-center gap-2.5">
                      {item.selected ? (
                        <SuggestionCheckCircleIcon />
                      ) : (
                        <span className="size-6 shrink-0 rounded-full border-[1.8px] border-purple-stroke bg-surface" />
                      )}
                      <span className="font-sans text-[13px] leading-[17px] font-bold text-ink">
                        {item.title}
                      </span>
                    </div>
                    <span className="w-[68px] shrink-0 text-right font-mono text-[10px] leading-xs font-bold text-purple-stroke">
                      {item.dueDate}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-purple-stroke/50 bg-surface/70 p-4 text-center font-sans text-sm text-purple-stroke">
                Nenhuma sugestão pendente em memória. Clique em{" "}
                <strong>Gerar Sugestões com IA</strong> no topo para pedir um
                novo lote.
              </div>
            )}

            <div className="flex w-full items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={discardSuggestions}
                disabled={activePlan.copilotSuggestions.length === 0}
                className="flex h-[42px] items-center justify-center rounded-full border-[1.8px] border-purple-stroke bg-surface px-[18px] font-sans text-[13px] leading-sm font-bold text-purple-stroke transition-colors hover:bg-surface-subtle disabled:opacity-40"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={acceptSuggestionsBatch}
                disabled={selectedSuggestions.length === 0}
                className="flex h-[42px] grow basis-0 items-center justify-center rounded-full border-[1.8px] border-purple-stroke bg-accent-ai px-4 font-sans text-[13px] leading-sm font-bold text-purple-stroke transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Aceitar Lote Selecionado ({selectedSuggestions.length})
              </button>
            </div>
          </div>

          {/* Card 2: Editorial Pausas Reduzem o Estresse */}
          <div className="flex w-full items-center gap-5.5 rounded-2xl border-[1.5px] border-border bg-surface p-6">
            <div className="flex h-[116px] w-[108px] shrink-0 items-center justify-center">
              <CopilotCupIcon size={96} />
            </div>
            <div className="flex grow basis-0 flex-col gap-2">
              <h3 className="font-display text-[24px] leading-[27px] font-extrabold tracking-[-0.03em] text-ink">
                Pausas Reduzem o Estresse.
              </h3>
              <p className="font-sans text-[13px] leading-[19px] font-medium text-ink-secondary">
                Você já concluiu {activePlan.progress}% da{" "}
                {activePlan.sidebarTitle.toLowerCase()} com{" "}
                {activePlan.daysRemaining} dias de antecedência. Aproveite o
                ritmo calmo e revise apenas 1 lote por semana.
              </p>
            </div>
          </div>

          {/* Card 3: Distribuição de Status */}
          <div className="flex w-full flex-col gap-3.5 rounded-2xl border-[1.5px] border-border bg-surface px-6 py-5.5">
            <div className="flex w-full items-center justify-between">
              <h3 className="font-display text-lg/md font-extrabold tracking-[-0.02em] text-ink">
                Distribuição de Status.
              </h3>
              <span className="font-mono text-xs/xs font-semibold text-ink-muted uppercase">
                {activePlan.totalTasks} TAREFAS TOTAIS
              </span>
            </div>

            <div className="flex w-full gap-3">
              {/* DONE */}
              <div className="flex grow basis-0 flex-col gap-2 rounded-[18px] border-[1.5px] border-primary bg-primary-soft p-3.5">
                <div className="flex items-center justify-between">
                  <StatusDoneCircleIcon />
                  <span className="font-mono text-[10px] leading-3 font-bold text-primary">
                    DONE
                  </span>
                </div>
                <span className="font-display text-xl leading-[30px] font-extrabold text-primary">
                  {String(activePlan.completedTasks).padStart(2, "0")}
                </span>
                <span className="font-sans text-xs/xs font-semibold text-primary">
                  Concluídas
                </span>
              </div>

              {/* ACTIVE / IN_PROGRESS */}
              <div className="flex grow basis-0 flex-col gap-2 rounded-[18px] border-[1.5px] border-danger bg-danger-soft p-3.5">
                <div className="flex items-center justify-between">
                  <StatusActiveClockIcon />
                  <span className="font-mono text-[10px] leading-3 font-bold text-danger">
                    ACTIVE
                  </span>
                </div>
                <span className="font-display text-xl leading-[30px] font-extrabold text-danger">
                  {String(activePlan.inProgressTasks).padStart(2, "0")}
                </span>
                <span className="font-sans text-xs/xs font-semibold text-danger">
                  Em Andamento
                </span>
              </div>

              {/* TODO */}
              <div className="flex grow basis-0 flex-col gap-2 rounded-[18px] border-[1.5px] border-ink bg-canvas p-3.5">
                <div className="flex items-center justify-between">
                  <StatusTodoDotIcon />
                  <span className="font-mono text-[10px] leading-3 font-bold text-ink">
                    TODO
                  </span>
                </div>
                <span className="font-display text-xl leading-[30px] font-extrabold text-ink">
                  {String(activePlan.todoTasks).padStart(2, "0")}
                </span>
                <span className="font-sans text-xs/xs font-semibold text-ink-secondary">
                  Pendentes
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
