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
  TrendingUp,
  Truck,
} from "lucide-react"

import { HeroHouseCheckIcon } from "@/components/icons/duotone"
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
    <main className="flex grow basis-0 flex-col gap-8 bg-canvas px-6 py-8 desktop:px-9">
      {/* Topbar: Identificação + Status do Backend + Botão Novo Plano */}
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-[26px] leading-[32px] font-extrabold tracking-[-0.02em] text-ink">
              Painel de Mudanças
            </h1>
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs/xs font-semibold text-primary">
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
          <p className="font-sans text-sm leading-5 text-ink-muted">
            Acompanhe o cronograma, checklists inteligentes e sugestões do seu Copiloto IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshPlans()}
            disabled={isLoadingPlans}
            className="flex items-center gap-2"
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
            <span>Novo Plano de Mudança</span>
          </Button>
        </div>
      </header>

      {/* Grid de Métricas Principais (4 Cards) */}
      <section className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {/* Card 1: Total de Planos */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs/xs font-bold tracking-wider text-ink-secondary uppercase">
              Planos Cadastrados
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Compass className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[32px] leading-tight font-extrabold text-ink">
                {totalPlans}
              </span>
              <span className="font-sans text-xs/xs font-semibold text-ink-muted">
                {totalPlans === 1 ? "mudança ativa" : "mudanças ativas"}
              </span>
            </div>
            <span className="font-sans text-xs/xs text-ink-muted">
              {totalPlans > 0
                ? "Rotas salvas e monitoradas no banco"
                : "Nenhum plano cadastrado"}
            </span>
          </div>
        </div>

        {/* Card 2: Próxima Mudança */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs/xs font-bold tracking-wider text-ink-secondary uppercase">
              Próxima Mudança
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-pink-soft text-danger">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            {upcomingPlan ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[32px] leading-tight font-extrabold text-ink">
                    {upcomingPlan.daysRemaining}
                  </span>
                  <span className="font-sans text-xs/xs font-semibold text-ink-muted">
                    dias restantes
                  </span>
                </div>
                <span className="font-sans text-xs/xs font-semibold text-ink-secondary truncate">
                  {upcomingPlan.shortRoute} ({upcomingPlan.movingDate})
                </span>
              </>
            ) : (
              <>
                <span className="font-display text-[24px] leading-tight font-bold text-ink-muted">
                  —
                </span>
                <span className="font-sans text-xs/xs text-ink-muted">
                  Defina um plano para ver o cronômetro
                </span>
              </>
            )}
          </div>
        </div>

        {/* Card 3: Progresso Global de Tarefas */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs/xs font-bold tracking-wider text-ink-secondary uppercase">
              Conclusão Global
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[32px] leading-tight font-extrabold text-ink">
                {globalProgress}%
              </span>
              <span className="font-mono text-xs/xs font-semibold text-ink-secondary">
                {completedTasks}/{totalTasks} tarefas
              </span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-subtle border border-border">
              <div
                className="h-full bg-icon-mint transition-all duration-500"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Copiloto IA Status */}
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs/xs font-bold tracking-wider text-purple-stroke uppercase">
              Copiloto IA
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-accent-ai-soft text-accent-ai">
              <Sparkles className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[26px] leading-tight font-extrabold text-purple-stroke">
                Ollama Llama 3.2
              </span>
            </div>
            <span className="font-sans text-xs/xs text-ink-muted">
              Geração preditiva de burocracias &amp; prazos ativos
            </span>
          </div>
        </div>
      </section>

      {/* Seção Central: Caso 0 Planos (Onboarding Hero) vs Caso >= 1 Planos (Grid de Planos) */}
      {totalPlans === 0 && !isLoadingPlans ? (
        <section className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-dashed border-border bg-surface px-8 py-14 text-center shadow-sm">
          <div className="flex size-20 items-center justify-center rounded-2xl border-[1.8px] border-primary bg-primary-soft">
            <HeroHouseCheckIcon />
          </div>

          <div className="flex max-w-xl flex-col gap-2.5">
            <div className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-accent-ai-soft px-3.5 py-1 text-purple-stroke">
              <Sparkles className="size-3.5 text-accent-ai" />
              <span className="font-sans text-xs/xs font-bold">
                Planejamento Inteligente de Mudanças
              </span>
            </div>

            <h2 className="font-display text-[28px] leading-[34px] font-extrabold tracking-[-0.02em] text-ink">
              Organize sua mudança sem estresse ou prazos esquecidos.
            </h2>
            <p className="font-sans text-base/base text-ink-muted">
              O LifePilot AI combina análise de rota com um modelo de linguagem local para criar um checklist completo com tarefas consulares, bancárias, alfandegárias e domésticas.
            </p>
          </div>

          {/* 3 Passos Visuais */}
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 pt-2 tablet:grid-cols-3">
            <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-5 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-icon-mint">
                1
              </div>
              <span className="font-display text-base/sm font-bold text-ink">
                Defina sua Rota
              </span>
              <p className="font-sans text-xs/xs text-ink-muted leading-relaxed">
                Informe cidade de origem, destino internacional ou nacional e data prevista.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-5 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent-ai font-display text-sm font-bold text-surface">
                2
              </div>
              <span className="font-display text-base/sm font-bold text-ink">
                Copiloto IA Sugere
              </span>
              <p className="font-sans text-xs/xs text-ink-muted leading-relaxed">
                A IA analisa a rota e sugere tarefas com prazos calculados antes da data limite.
              </p>
            </div>

            <div className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface-subtle p-5 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-icon-mint">
                3
              </div>
              <span className="font-display text-base/sm font-bold text-ink">
                Acompanhe e Conclua
              </span>
              <p className="font-sans text-xs/xs text-ink-muted leading-relaxed">
                Checklist visual, filtros rápidos e sincronização contínua com seu banco de dados.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="default"
              size="lg"
              onClick={() => router.push("/novo-plano")}
              className="flex items-center gap-3 px-8 text-base/sm shadow-md"
            >
              <span>Criar Meu Primeiro Plano de Mudança</span>
              <ArrowRight className="size-5 text-icon-mint" />
            </Button>
          </div>
        </section>
      ) : (
        <>
          {/* Banner de CTA de Alto Impacto para Adicionar Novo Plano */}
          <section className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary-soft/40 via-surface to-accent-ai-soft/30 p-6 desktop:p-8">
            <div className="flex flex-col justify-between gap-6 tablet:flex-row tablet:items-center">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-3 py-1 text-icon-mint">
                  <Sparkles className="size-3.5" />
                  <span className="font-mono text-xs/xs font-bold uppercase tracking-wider">
                    Copiloto Ativo
                  </span>
                </div>
                <h2 className="font-display text-[22px] leading-[28px] font-extrabold text-ink">
                  Planejando outra mudança ou nova etapa de moradia?
                </h2>
                <p className="font-sans text-sm leading-relaxed text-ink-secondary">
                  Adicione uma nova rota e receba um checklist inteligente gerado em tempo real com todas as obrigações e prazos calculados.
                </p>
              </div>

              <div className="shrink-0">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => router.push("/novo-plano")}
                  className="flex items-center gap-2.5 shadow-sm"
                >
                  <Plus className="size-4 text-icon-mint" />
                  <span>Cadastrar Novo Plano</span>
                </Button>
              </div>
            </div>
          </section>

          {/* Grid de Planos Cadastrados */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl/md font-bold text-ink">
                  Seus Planos em Andamento
                </h2>
                <span className="rounded-full bg-surface-subtle px-2.5 py-0.5 font-mono text-xs/xs font-bold text-ink-secondary">
                  {plans.length}
                </span>
              </div>
              <span className="font-mono text-xs/xs text-ink-muted">
                Clique em um card para abrir o workspace
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 tablet:grid-cols-2 desktop:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-icon-mint">
                          <Truck className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs/xs font-bold text-ink-secondary">
                            {plan.shortRoute}
                          </span>
                          <h3 className="font-display text-[17px] leading-[22px] font-bold text-ink group-hover:text-primary">
                            {plan.title.replace(/\.$/, "")}
                          </h3>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-primary bg-icon-mint/40 px-2.5 py-1 font-mono text-xs/xs font-bold text-primary">
                        {plan.daysRemaining} DIAS
                      </span>
                    </div>

                    {/* Origem e Destino com ícones */}
                    <div className="flex flex-col gap-1.5 rounded-lg bg-surface-subtle p-3 text-xs/xs text-ink-secondary">
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
                      <div className="flex items-center justify-between font-mono text-xs/xs">
                        <span className="text-ink-secondary">Progresso</span>
                        <span className="font-bold text-ink">
                          {plan.progress}% ({plan.completedTasks}/{plan.totalTasks})
                        </span>
                      </div>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-subtle border border-border">
                        <div
                          className="h-full bg-icon-mint transition-all"
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rodapé com Botão para Abrir Workspace */}
                  <div className="mt-5 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="default"
                      className="w-full justify-between group-hover:border-primary group-hover:bg-primary-soft/30"
                      onClick={() => router.push(`/planos/${plan.id}`)}
                    >
                      <span className="font-sans text-xs/xs font-bold text-ink">
                        Abrir Workspace &amp; Copiloto
                      </span>
                      <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Seção Inferior: Próximas Tarefas Urgentes + Dica de Relocação */}
          <div className="grid grid-cols-1 gap-6 desktop:grid-cols-3">
            {/* Lista de Ações Imediatas */}
            <section className="flex flex-col gap-4 desktop:col-span-2 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="size-5 text-primary" />
                  <h3 className="font-display text-lg/md font-bold text-ink">
                    Ações Prioritárias Pendentes
                  </h3>
                </div>
                <span className="font-mono text-xs/xs text-ink-muted">
                  Top 5 mais urgentes
                </span>
              </div>

              {urgentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-surface-subtle p-8 text-center">
                  <CheckCircle2 className="size-8 text-icon-mint" />
                  <span className="font-sans text-sm font-semibold text-ink">
                    Tudo em dia!
                  </span>
                  <span className="font-sans text-xs text-ink-muted">
                    Nenhuma tarefa pendente no momento.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {urgentTasks.map((t) => (
                    <div
                      key={t.taskId}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => void cycleTaskStatus(t.taskId)}
                          title="Clique para alternar status"
                          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface hover:border-primary"
                        >
                          {t.status === "IN_PROGRESS" ? (
                            <div className="size-2.5 rounded-full bg-danger animate-pulse" />
                          ) : (
                            <div className="size-2 rounded-full bg-ink-muted" />
                          )}
                        </button>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-sans text-sm font-semibold text-ink">
                            {t.taskTitle}
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-ink-secondary">
                            <span className="rounded bg-surface-subtle px-1.5 py-0.5 font-bold">
                              {t.planTitle}
                            </span>
                            {t.dueDate && (
                              <span>Prazo: {t.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Badge
                          variant={t.status === "IN_PROGRESS" ? "in_progress" : "todo"}
                          appearance="solid"
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
            <section className="flex flex-col justify-between gap-4 rounded-xl border border-purple-stroke/40 bg-accent-ai-soft/30 p-6 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-purple-stroke">
                  <Sparkles className="size-5 text-accent-ai" />
                  <span className="font-display text-base/sm font-bold">
                    Dica do Copiloto IA
                  </span>
                </div>
                <p className="font-sans text-xs/base text-ink leading-relaxed">
                  Para mudanças internacionais, providencie a <strong>Apostila de Haia</strong> e a tradução juramentada com pelo menos <strong>45 dias de antecedência</strong>.
                </p>
                <p className="font-sans text-xs/base text-ink-secondary leading-relaxed">
                  O Copiloto valida automaticamente que nenhuma tarefa seja agendada após a data final do seu plano.
                </p>
              </div>

              <div className="rounded-lg border border-purple-stroke/30 bg-surface/80 p-3.5 text-center">
                <span className="font-mono text-xs/xs font-bold text-purple-stroke">
                  LLM LOCAL 100% OPERACIONAL
                </span>
                <p className="mt-1 font-sans text-[11px] text-ink-muted">
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
