"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "cn"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react"

import { HeroHouseCheckIcon } from "@/components/icons/duotone"
import { DeletePlanDialog } from "@/components/plans/delete-plan-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useWorkspaceStore } from "@/context/workspace-store"
import type { MovingPlan } from "@/types/plan"

export function DashboardView() {
  const router = useRouter()
  const {
    plans,
    isLoadingPlans,
    isOnline,
    isSyncing,
    refreshPlans,
    cycleTaskStatus,
  } = useWorkspaceStore()

  // Estatísticas agregadas
  const totalPlans = plans.length
  const totalTasks = plans.reduce((acc, p) => acc + p.totalTasks, 0)
  const completedTasks = plans.reduce((acc, p) => acc + p.completedTasks, 0)
  const globalProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Próximo plano (com menor dias restantes >= 0 ou primeiro)
  const upcomingPlan: MovingPlan | null = React.useMemo(() => {
    if (plans.length === 0) return null
    return [...plans].sort((a, b) => a.daysRemaining - b.daysRemaining)[0]
  }, [plans])

  // Todas as tarefas pendentes para visão rápida de ações imediatas
  const urgentTasks = React.useMemo(() => {
    const list: Array<{
      planId: string
      planTitle: string
      taskId: string
      taskTitle: string
      dueDate: string
      status: "TODO" | "IN_PROGRESS"
    }> = []

    for (const plan of plans) {
      for (const task of plan.tasks) {
        if (task.status !== "DONE") {
          list.push({
            planId: plan.id,
            planTitle: plan.sidebarTitle,
            taskId: task.id,
            taskTitle: task.title,
            dueDate: task.dueDate,
            status: task.status,
          })
        }
      }
    }

    // Ordena por prazo mais próximo
    return list
      .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
      .slice(0, 5)
  }, [plans])

  return (
    <main className="flex grow basis-0 flex-col gap-5 bg-canvas px-4 py-4 tablet:gap-8 tablet:px-6 tablet:py-8 desktop:px-9">
      {/* Topbar: Identificação + Status do Backend + Botão Novo Plano */}
      <header className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink tablet:text-[26px] tablet:leading-[32px]">
              Painel de Mudanças
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] font-semibold text-primary tablet:px-2.5 tablet:text-xs/xs">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  isOnline
                    ? isSyncing
                      ? "animate-pulse bg-accent-ai"
                      : "bg-icon-mint"
                    : "bg-danger"
                )}
              />
              {isOnline ? (isSyncing ? "Sincronizando..." : "API v1 Online") : "Offline"}
            </span>
          </div>
          <p className="hidden font-sans text-xs text-ink-muted tablet:block tablet:text-sm tablet:leading-5">
            Acompanhe o cronograma, checklists inteligentes e sugestões do seu Copiloto IA.
          </p>
        </div>

        <div className="flex items-center gap-2 tablet:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshPlans()}
            disabled={isLoadingPlans}
            className="flex items-center gap-1.5 px-2.5 tablet:gap-2 tablet:px-3"
          >
            <RefreshCw
              className={cn("size-3.5", isLoadingPlans && "animate-spin text-primary")}
            />
            <span className="font-sans text-xs/xs font-bold">Atualizar</span>
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={() => router.push("/novo-plano")}
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="size-4 text-icon-mint" />
            <span className="hidden tablet:inline">Novo Plano de Mudança</span>
            <span className="tablet:hidden">Novo Plano</span>
          </Button>
        </div>
      </header>

      {/* Grid de Métricas Principais (2 colunas no mobile, 4 no desktop) */}
      <section className="grid grid-cols-2 gap-3 tablet:grid-cols-2 tablet:gap-4 desktop:grid-cols-4">
        {/* Card 1: Total de Planos */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 tablet:gap-4 tablet:p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider text-ink-secondary uppercase tablet:text-xs/xs">
              Planos
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary tablet:size-9">
              <Compass className="size-4 tablet:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-extrabold text-ink tablet:text-[32px] tablet:leading-tight">
                {totalPlans}
              </span>
              <span className="font-sans text-[10px] font-semibold text-ink-muted tablet:text-xs/xs">
                {totalPlans === 1 ? "ativo" : "ativos"}
              </span>
            </div>
            <span className="truncate font-sans text-[10px] text-ink-muted tablet:text-xs/xs">
              {totalPlans > 0 ? "Rotas salvas" : "Nenhum plano"}
            </span>
          </div>
        </div>

        {/* Card 2: Próxima Mudança */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 tablet:gap-4 tablet:p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider text-ink-secondary uppercase tablet:text-xs/xs">
              Próxima Mudança
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-pink-soft text-danger tablet:size-9">
              <Clock className="size-4 tablet:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {upcomingPlan ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-extrabold text-ink tablet:text-[32px] tablet:leading-tight">
                    {upcomingPlan.daysRemaining}
                  </span>
                  <span className="font-sans text-[10px] font-semibold text-ink-muted tablet:text-xs/xs">
                    dias
                  </span>
                </div>
                <span className="truncate font-sans text-[10px] font-semibold text-ink-secondary tablet:text-xs/xs">
                  {upcomingPlan.shortRoute}
                </span>
              </>
            ) : (
              <>
                <span className="font-display text-xl font-bold text-ink-muted tablet:text-[24px]">
                  —
                </span>
                <span className="font-sans text-[10px] text-ink-muted tablet:text-xs/xs">
                  Sem data definida
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Progresso Global de Tarefas */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 tablet:gap-4 tablet:p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider text-ink-secondary uppercase tablet:text-xs/xs">
              Conclusão
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary tablet:size-9">
              <TrendingUp className="size-4 tablet:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-extrabold text-ink tablet:text-[32px] tablet:leading-tight">
                {globalProgress}%
              </span>
              <span className="font-mono text-[10px] font-semibold text-ink-secondary tablet:text-xs/xs">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <div className="flex h-1.5 w-full overflow-hidden rounded-full border border-border bg-surface-subtle tablet:h-2">
              <div
                className="h-full bg-icon-mint transition-all duration-500"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Copiloto IA Status */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm transition-transform hover:-translate-y-0.5 tablet:gap-4 tablet:p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold tracking-wider text-purple-stroke uppercase tablet:text-xs/xs">
              Copiloto IA
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent-ai-soft text-accent-ai tablet:size-9">
              <Sparkles className="size-4 tablet:size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="truncate font-display text-lg font-extrabold text-purple-stroke tablet:text-[24px]">
                Llama 3.2
              </span>
            </div>
            <span className="truncate font-sans text-[10px] text-ink-muted tablet:text-xs/xs">
              LLM local ativa
            </span>
          </div>
        </div>
      </section>

      {/* Seção Central: Caso 0 Planos (Onboarding Hero) vs Caso >= 1 Planos (Grid de Planos) */}
      {totalPlans === 0 && !isLoadingPlans ? (
        <section className="flex flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-border bg-surface px-5 py-10 text-center shadow-sm tablet:gap-6 tablet:px-8 tablet:py-14">
          <div className="flex size-16 items-center justify-center rounded-2xl border-[1.8px] border-primary bg-primary-soft tablet:size-20">
            <HeroHouseCheckIcon />
          </div>

          <div className="flex max-w-xl flex-col gap-2">
            <div className="inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-accent-ai-soft px-3 py-1 text-purple-stroke">
              <Sparkles className="size-3 text-accent-ai" />
              <span className="font-sans text-xs/xs font-bold">
                Planejamento Inteligente
              </span>
            </div>

            <h2 className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink tablet:text-[28px] tablet:leading-[34px]">
              Organize sua mudança sem estresse ou prazos esquecidos.
            </h2>
            <p className="font-sans text-xs text-ink-muted tablet:text-base/base">
              O LifePilot AI combina análise de rota com um modelo de linguagem local para criar um checklist completo com tarefas consulares, bancárias, alfandegárias e domésticas.
            </p>
          </div>

          {/* 3 Passos Visuais */}
          <div className="grid w-full max-w-3xl grid-cols-1 gap-3 pt-1 tablet:grid-cols-3 tablet:gap-4 tablet:pt-2">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-subtle p-4 text-center tablet:gap-2.5 tablet:p-5">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-icon-mint tablet:size-10 tablet:text-sm">
                1
              </div>
              <span className="font-display text-sm font-bold text-ink tablet:text-base/sm">
                Defina sua Rota
              </span>
              <p className="font-sans text-xs/xs leading-relaxed text-ink-muted">
                Informe cidade de origem, destino e data prevista.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-subtle p-4 text-center tablet:gap-2.5 tablet:p-5">
              <div className="flex size-9 items-center justify-center rounded-full bg-accent-ai font-display text-xs font-bold text-surface tablet:size-10 tablet:text-sm">
                2
              </div>
              <span className="font-display text-sm font-bold text-ink tablet:text-base/sm">
                Copiloto IA Sugere
              </span>
              <p className="font-sans text-xs/xs leading-relaxed text-ink-muted">
                A IA analisa a rota e sugere tarefas com prazos calculados.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-subtle p-4 text-center tablet:gap-2.5 tablet:p-5">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-icon-mint tablet:size-10 tablet:text-sm">
                3
              </div>
              <span className="font-display text-sm font-bold text-ink tablet:text-base/sm">
                Acompanhe e Conclua
              </span>
              <p className="font-sans text-xs/xs leading-relaxed text-ink-muted">
                Checklist visual e sincronização contínua com seu banco.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={() => router.push("/novo-plano")}
              className="flex items-center gap-2.5 px-6 text-sm shadow-md tablet:gap-3 tablet:px-8 tablet:text-base/sm"
            >
              <span>Criar Meu Primeiro Plano</span>
              <ArrowRight className="size-4 text-icon-mint tablet:size-5" />
            </Button>
          </div>
        </section>
      ) : (
        <>
          {/* Banner de CTA de Alto Impacto para Adicionar Novo Plano */}
          <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary-soft/40 via-surface to-accent-ai-soft/30 p-5 tablet:p-6 desktop:p-8">
            <div className="flex flex-col justify-between gap-4 tablet:flex-row tablet:items-center tablet:gap-6">
              <div className="flex max-w-xl flex-col gap-1.5 tablet:gap-2">
                <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary px-2.5 py-0.5 text-icon-mint tablet:px-3 tablet:py-1">
                  <Sparkles className="size-3 tablet:size-3.5" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider tablet:text-xs/xs">
                    Copiloto Ativo
                  </span>
                </div>
                <h2 className="font-display text-lg font-extrabold text-ink tablet:text-[22px] tablet:leading-[28px]">
                  Planejando outra mudança ou nova etapa de moradia?
                </h2>
                <p className="font-sans text-xs leading-relaxed text-ink-secondary tablet:text-sm">
                  Adicione uma nova rota e receba um checklist inteligente gerado em tempo real com todas as obrigações e prazos calculados.
                </p>
              </div>

              <div className="shrink-0">
                <Button
                  variant="default"
                  size="default"
                  onClick={() => router.push("/novo-plano")}
                  className="w-full flex items-center justify-center gap-2 shadow-sm tablet:w-auto"
                >
                  <Plus className="size-4 text-icon-mint" />
                  <span>Cadastrar Novo Plano</span>
                </Button>
              </div>
            </div>
          </section>

          {/* Grid de Planos Cadastrados */}
          <section className="flex flex-col gap-3.5 tablet:gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-ink tablet:text-xl/md">
                  Seus Planos em Andamento
                </h2>
                <span className="rounded-full bg-surface-subtle px-2 py-0.5 font-mono text-[10px] font-bold text-ink-secondary tablet:px-2.5 tablet:text-xs/xs">
                  {plans.length}
                </span>
              </div>
              <span className="hidden font-mono text-xs/xs text-ink-muted tablet:inline">
                Clique para abrir o workspace
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 tablet:gap-5 desktop:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-primary hover:shadow-md tablet:p-6"
                >
                  <div className="flex flex-col gap-3.5 tablet:gap-4">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-icon-mint tablet:size-11">
                          <Truck className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-bold text-ink-secondary tablet:text-xs/xs">
                            {plan.shortRoute}
                          </span>
                          <h3 className="font-display text-base font-bold text-ink group-hover:text-primary tablet:text-[17px] tablet:leading-[22px]">
                            {plan.title.replace(/\.$/, "")}
                          </h3>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-primary bg-icon-mint/40 px-2 py-0.5 font-mono text-[10px] font-bold text-primary tablet:px-2.5 tablet:py-1 tablet:text-xs/xs">
                        {plan.daysRemaining} DIAS
                      </span>
                    </div>

                    {/* Origem e Destino com ícones */}
                    <div className="flex flex-col gap-1.5 rounded-lg bg-surface-subtle p-2.5 text-xs text-ink-secondary tablet:p-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0 text-ink-muted" />
                        <span className="truncate">
                          <strong>De:</strong> {plan.origin}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate">
                          <strong>Para:</strong> {plan.destination}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 shrink-0 text-danger" />
                        <span>
                          <strong>Data da Mudança:</strong> {plan.movingDate}
                        </span>
                      </div>
                    </div>

                    {/* Progresso de Tarefas */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px] tablet:text-xs/xs">
                        <span className="text-ink-secondary">Progresso</span>
                        <span className="font-bold text-ink">
                          {plan.progress}% ({plan.completedTasks}/{plan.totalTasks})
                        </span>
                      </div>
                      <div className="flex h-1.5 w-full overflow-hidden rounded-full border border-border bg-surface-subtle tablet:h-2">
                        <div
                          className="h-full bg-icon-mint transition-all"
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rodapé com Botão para Abrir Workspace + Excluir */}
                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 tablet:mt-5 tablet:pt-4">
                    <Button
                      variant="outline"
                      size="default"
                      className="grow justify-between group-hover:border-primary group-hover:bg-primary-soft/30"
                      onClick={() => router.push(`/planos/${plan.id}`)}
                    >
                      <span className="font-sans text-xs/xs font-bold text-ink">
                        Abrir Workspace &amp; Copiloto
                      </span>
                      <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                    </Button>

                    <DeletePlanDialog
                      planId={plan.id}
                      planTitle={plan.title}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Excluir este plano de mudança"
                          className="size-9 shrink-0 text-ink-muted hover:border-danger hover:bg-danger-soft hover:text-danger tablet:size-10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção Inferior: Próximas Tarefas Urgentes + Dica de Relocação */}
          <div className="grid grid-cols-1 gap-4 tablet:gap-6 desktop:grid-cols-3">
            {/* Lista de Ações Imediatas */}
            <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm tablet:gap-4 tablet:p-6 desktop:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-4 text-primary tablet:size-5" />
                  <h3 className="font-display text-base font-bold text-ink tablet:text-lg/md">
                    Ações Prioritárias Pendentes
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-ink-muted tablet:text-xs/xs">
                  Top 5 mais urgentes
                </span>
              </div>

              {urgentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-surface-subtle p-6 text-center tablet:p-8">
                  <CheckCircle2 className="size-7 text-icon-mint tablet:size-8" />
                  <span className="font-sans text-xs font-semibold text-ink tablet:text-sm">
                    Tudo em dia!
                  </span>
                  <span className="font-sans text-[11px] text-ink-muted tablet:text-xs">
                    Nenhuma tarefa pendente no momento.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {urgentTasks.map((t) => (
                    <div
                      key={t.taskId}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 tablet:gap-4 tablet:py-3"
                    >
                      <div className="flex min-w-0 items-start gap-2.5 tablet:gap-3">
                        <button
                          type="button"
                          onClick={() => void cycleTaskStatus(t.taskId)}
                          title="Clique para alternar status"
                          className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-primary tablet:size-5"
                        >
                          {t.status === "IN_PROGRESS" ? (
                            <div className="size-2 rounded-full bg-danger animate-pulse tablet:size-2.5" />
                          ) : (
                            <div className="size-1.5 rounded-full bg-ink-muted tablet:size-2" />
                          )}
                        </button>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-sans text-xs font-semibold text-ink tablet:text-sm">
                            {t.taskTitle}
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[10px] text-ink-secondary tablet:text-[11px]">
                            <span className="truncate rounded bg-surface-subtle px-1 py-0.5 font-bold">
                              {t.planTitle}
                            </span>
                            {t.dueDate && (
                              <span className="shrink-0">{t.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Badge
                          variant={t.status === "IN_PROGRESS" ? "in_progress" : "todo"}
                          appearance="solid"
                          className="text-[10px] tablet:text-xs"
                        >
                          {t.status === "IN_PROGRESS" ? "Em andamento" : "A fazer"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Dica da IA / Copilot Insight Card */}
            <section className="flex flex-col justify-between gap-3 rounded-xl border border-purple-stroke/40 bg-accent-ai-soft/30 p-4 shadow-sm tablet:gap-4 tablet:p-6">
              <div className="flex flex-col gap-2 tablet:gap-3">
                <div className="flex items-center gap-2 text-purple-stroke">
                  <Sparkles className="size-4 text-accent-ai tablet:size-5" />
                  <span className="font-display text-sm font-bold tablet:text-base/sm">
                    Dica do Copiloto IA
                  </span>
                </div>
                <p className="font-sans text-xs text-ink leading-relaxed">
                  Para mudanças internacionais, providencie a <strong>Apostila de Haia</strong> e a tradução juramentada com pelo menos <strong>45 dias de antecedência</strong>.
                </p>
                <p className="font-sans text-xs text-ink-secondary leading-relaxed">
                  O Copiloto valida automaticamente que nenhuma tarefa seja agendada após a data final do seu plano.
                </p>
              </div>

              <div className="rounded-lg border border-purple-stroke/30 bg-surface/80 p-3 text-center tablet:p-3.5">
                <span className="font-mono text-[10px] font-bold text-purple-stroke tablet:text-xs/xs">
                  LLM LOCAL 100% OPERACIONAL
                </span>
                <p className="mt-0.5 font-sans text-[10px] text-ink-muted tablet:mt-1 tablet:text-[11px]">
                  Geração rápida de sugestões via Ollama no backend LifePilot.
                </p>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  )
}
