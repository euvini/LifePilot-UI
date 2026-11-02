"use client"

import * as React from "react"
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
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, RefreshCw, Trash2 } from "lucide-react"

import { DeletePlanDialog } from "@/components/plans/delete-plan-dialog"
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
      <main className="flex grow flex-col items-center justify-center gap-6 bg-canvas p-12 text-center">
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
        <div className="flex items-center gap-3">
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
    <main className="flex grow basis-0 flex-col gap-6 bg-canvas px-6 py-8 desktop:px-9">
      {/* Topbar: Breadcrumb + Gatilhos */}
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M8 1.5L9.8 6.2L14.5 8L9.8 9.8L8 14.5L6.2 9.8L1.5 8L6.2 6.2L8 1.5Z"
                fill="var(--color-accent-ai)"
                stroke="var(--color-purple-stroke)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {isGeneratingAi ? "IA Gerando..." : "Gerar Sugestões com IA"}
          </Button>

          <Button
            variant="outline"
            onClick={() => newTaskInputRef.current?.focus()}
            className="h-[42px] gap-2 px-[18px] text-[13px] leading-sm"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M8 3.5V12.5M3.5 8H12.5"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
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

      {/* Hero Card Forest Green do Plano Ativo */}
      <section className="flex w-full flex-col justify-between gap-7 rounded-2xl bg-primary px-7 py-6 desktop:flex-row desktop:items-center">
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

      {/* Grid Inferior: Checklist de Tarefas (Esquerda) + Copiloto IA & Status (Direita) */}
      <div className="flex w-full grow basis-0 flex-col items-start gap-6 desktop:flex-row">
        {/* Coluna Esquerda: Checklist de Tarefas */}
        <section className="flex w-full grow basis-0 flex-col gap-3.5 rounded-2xl bg-surface-subtle p-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-3 pb-1">
            <div className="flex grow basis-0 flex-col gap-0.5">
              <h2 className="font-display text-[24px] leading-[28px] font-extrabold tracking-[-0.02em] text-ink">
                Checklist de Tarefas.
              </h2>
              <p className="font-sans text-sm leading-4 font-semibold text-ink-secondary">
                Ordenadas por prazo limite · Validação automática dueDate ≤{" "}
                {activePlan.movingDate}
              </p>
            </div>

            {/* Segmented Filter: Todas / Pendentes */}
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-border bg-canvas p-1">
              <button
                type="button"
                onClick={() => {
                  setChecklistTab("all")
                  setQuickFilter("all")
                }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-[5px] font-sans text-xs/xs font-bold transition-colors",
                  checklistTab === "all"
                    ? "bg-ink text-surface"
                    : "text-ink-secondary hover:text-ink"
                )}
              >
                Todas ({activePlan.totalTasks})
              </button>
              <button
                type="button"
                onClick={() => setChecklistTab("pending")}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-[5px] font-sans text-xs/xs font-bold transition-colors",
                  checklistTab === "pending"
                    ? "bg-ink text-surface"
                    : "text-ink-secondary hover:text-ink"
                )}
              >
                Pendentes ({pendingTasksCount})
              </button>
            </div>
          </div>

          {/* Quick-Add Task Bar com DatePicker customizado */}
          <form
            onSubmit={handleAddQuickTask}
            className="flex w-full items-center justify-between gap-2.5 rounded-full border-[1.5px] border-dashed border-ink-muted bg-canvas py-2 pr-2.5 pl-[18px] focus-within:border-solid focus-within:border-primary"
          >
            <div className="flex grow basis-0 items-center gap-2.5">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  fill="var(--color-surface)"
                  stroke="var(--color-ink)"
                  strokeWidth="1.6"
                />
                <path
                  d="M9 6V12M6 9H12"
                  fill="none"
                  stroke="var(--color-ink)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={newTaskInputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                maxLength={200}
                placeholder="Adicionar nova tarefa ao plano (ex: Agendar vistoria de entrega das chaves)..."
                className="w-full bg-transparent font-sans text-[13px] leading-sm font-medium text-ink outline-none placeholder:text-ink-muted"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
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
                className="rounded-full bg-primary px-3.5 py-[7px] font-sans text-sm leading-4 font-bold text-icon-mint transition-colors hover:bg-primary-strong"
              >
                Adicionar
              </button>
            </div>
          </form>

          {/* Lista de Tarefas (Pills Ilustrativas) */}
          <div className="flex flex-col gap-3">
            {visibleTasks.map((task) => {
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
                    "group/task flex w-full items-center justify-between gap-3 rounded-full bg-surface px-4 py-3 transition-all",
                    task.highlighted && "border-[1.8px] border-ink"
                  )}
                >
                  <div className="flex grow basis-0 items-center gap-3.5">
                    <TaskCategoryIcon icon={task.icon} status={task.status} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans text-base/sm font-bold text-ink">
                        {task.title}
                      </span>
                      <span
                        className={cn(
                          "font-sans text-sm leading-4 font-medium",
                          task.highlighted
                            ? "text-ink-secondary"
                            : "text-ink-muted"
                        )}
                      >
                        {task.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "w-[82px] shrink-0 text-right font-mono text-xs/xs font-semibold",
                        task.highlighted ? "text-ink" : "text-ink-muted"
                      )}
                    >
                      {task.dueDate}
                    </span>

                    <button
                      type="button"
                      title="Clique para alternar o status da tarefa"
                      onClick={() => cycleTaskStatus(task.id)}
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

                    <button
                      type="button"
                      title="Eliminar tarefa (HTTP 204)"
                      onClick={() => deleteTask(task.id)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-muted opacity-0 transition-all group-hover/task:opacity-100 hover:border-danger hover:bg-danger-soft hover:text-danger focus:opacity-100"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Coluna Direita: Copiloto IA + Card Editorial + Distribuição de Status */}
        <aside className="flex w-full shrink-0 flex-col gap-5 desktop:w-[440px]">
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
