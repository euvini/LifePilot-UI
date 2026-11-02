"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "cn"
import {
  ArrowRight,
  Check,
  Home,
  MapPin,
  Navigation,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
} from "lucide-react"
import { toast } from "sonner"

import { DatePicker } from "@/components/ui/date-picker"
import { useWorkspaceStore } from "@/context/workspace-store"
import { api, ApiError } from "@/lib/api/client"
import { computeDaysRemaining } from "@/lib/storage/mappers"
import type { CopilotSuggestion } from "@/types/plan"

const MAX_SUGGESTIONS_OPTIONS = [
  { value: 5, label: "5 tarefas" },
  { value: 10, label: "10 tarefas (Recomendado)" },
  { value: 15, label: "15 tarefas" },
  { value: 20, label: "20 (Máx)" },
] as const

const DEFAULT_MOVING_DATE = "2027-01-15"

export function NewPlanWizard({ initialStep = 1 }: { initialStep?: 1 | 2 }) {
  const router = useRouter()
  const { createNewPlan, refreshPlans, refreshActivePlanTasks } =
    useWorkspaceStore()

  const [step, setStep] = React.useState<1 | 2>(initialStep)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false)
  const [createdPlanId, setCreatedPlanId] = React.useState<string | null>(null)

  // Etapa 1 — Parâmetros do Plano
  const [title, setTitle] = React.useState("")
  const [origin, setOrigin] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const [movingDate, setMovingDate] = React.useState(DEFAULT_MOVING_DATE)
  const [maxSuggestions, setMaxSuggestions] = React.useState<number>(10)

  // Etapa 2 — Sugestões Reais da API
  const [suggestions, setSuggestions] = React.useState<CopilotSuggestion[]>([])
  const [remainingQuota, setRemainingQuota] = React.useState(5)

  const selectedCount = suggestions.filter((s) => s.selected).length
  const [daysRemaining, setDaysRemaining] = React.useState(0)

  React.useEffect(() => {
    void Promise.resolve().then(() => {
      if (movingDate) {
        setDaysRemaining(computeDaysRemaining(movingDate))
      }
    })
  }, [movingDate])

  const hasInvalidDate = suggestions.some(
    (s) => s.selected && s.dueDate > movingDate
  )

  async function handleAdvanceToStep2(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !origin.trim() || !destination.trim() || !movingDate) {
      toast.error("Preencha todos os campos obrigatórios da rota.")
      return
    }

    setIsSubmitting(true)
    try {
      const plan = await createNewPlan({
        title: title.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        movingDate,
      })

      setCreatedPlanId(plan.id)
      setStep(2)
      toast.success("Plano criado no banco de dados! Gerando sugestões da IA...")

      // Gera sugestões reais da IA no backend
      setIsGeneratingAi(true)
      try {
        const res = await api.suggestions.generate(plan.id, {
          maxSuggestions,
        })

        const mapped: CopilotSuggestion[] = res.suggestions.map((s, idx) => ({
          id: `sugg-${idx}-${Date.now()}`,
          title: s.title,
          description: s.description ?? undefined,
          dueDate: s.dueDate || movingDate,
          selected: true,
        }))

        setSuggestions(mapped)
        toast.success(
          `${mapped.length} sugestões geradas pelo Copiloto IA (Llama 3.2).`
        )
      } catch (aiErr) {
        console.error("Falha ao gerar sugestões da IA:", aiErr)
        if (aiErr instanceof ApiError && aiErr.isThrottled) {
          toast.error("Limite de requisições de IA atingido. Tente regenerar em 1 minuto.")
        } else {
          toast.error("Não foi possível gerar sugestões automáticas agora. Você pode tentar regenerar.")
        }
      } finally {
        setIsGeneratingAi(false)
      }
    } catch (err) {
      toast.error("Erro ao criar o plano no servidor.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleToggleSuggestion(id: string) {
    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    )
  }

  function handleChangeSuggestionDate(id: string, newDate: string) {
    setSuggestions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dueDate: newDate } : item
      )
    )
  }

  async function handleRegenerate() {
    if (!createdPlanId) {
      toast.error("Identificador do plano não encontrado.")
      return
    }

    if (remainingQuota <= 0) {
      toast.error(
        "Limite de requisições excedido (HTTP 429 · máx. 5 req/min por IP)."
      )
      return
    }

    setIsGeneratingAi(true)
    try {
      setRemainingQuota((q) => q - 1)
      const res = await api.suggestions.generate(createdPlanId, {
        maxSuggestions,
      })

      const mapped: CopilotSuggestion[] = res.suggestions.map((s, idx) => ({
        id: `sugg-${idx}-${Date.now()}`,
        title: s.title,
        description: s.description ?? undefined,
        dueDate: s.dueDate || movingDate,
        selected: true,
      }))

      setSuggestions(mapped)
      toast.success(`${mapped.length} novas sugestões geradas pelo Copiloto IA!`)
    } catch (err) {
      if (err instanceof ApiError && err.isThrottled) {
        toast.error("Limite de IA excedido (HTTP 429). Aguarde alguns instantes.")
      } else {
        toast.error("Falha ao regenerar sugestões no backend.")
      }
    } finally {
      setIsGeneratingAi(false)
    }
  }

  async function handleConfirmBatch() {
    if (selectedCount === 0) {
      toast.error("Selecione ao menos uma tarefa para confirmar o lote.")
      return
    }
    if (hasInvalidDate) {
      toast.error(
        `Existem tarefas com prazo posterior ao teto (${movingDate}). Ajuste antes de confirmar.`
      )
      return
    }

    const selectedTasks = suggestions
      .filter((s) => s.selected)
      .map((s) => ({
        title: s.title,
        description: s.description || undefined,
        dueDate: s.dueDate || undefined,
      }))

    if (createdPlanId) {
      setIsSubmitting(true)
      try {
        await api.suggestions.accept(createdPlanId, { tasks: selectedTasks })
        await refreshPlans()
        await refreshActivePlanTasks()

        toast.success(
          `Lote de ${selectedCount} tarefas gravado atomicamente no banco (201 Created)!`
        )
        router.push(`/planos/${createdPlanId}`)
      } catch (err) {
        console.error("Erro ao aceitar lote:", err)
        toast.error("Falha ao salvar lote de tarefas no servidor.")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      router.push("/")
    }
  }

  return (
    <main className="flex grow basis-0 flex-col gap-6 bg-canvas px-6 py-8 desktop:px-9">
      {/* Topbar Breadcrumb + Endpoint + Cancelar */}
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        {step === 1 ? (
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="font-sans text-[13px] leading-4 font-medium text-ink-muted">
              <Link href="/" className="hover:text-ink">
                Dashboard Geral
              </Link>{" "}
              <span className="text-border-strong">/</span>{" "}
              <span className="font-semibold text-ink">
                Criar Novo Plano de Mudança
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-surface-subtle px-2.5 py-1">
              <span className="size-1.5 shrink-0 rounded-full bg-success" />
              <span className="font-mono text-xs/xs text-ink-secondary">
                POST /api/v1/moving-plans
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="font-sans text-[13px] leading-4 font-medium text-ink-muted">
              <Link href="/" className="hover:text-ink">
                Dashboard
              </Link>{" "}
              <span className="text-border-strong">/</span>{" "}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-ink"
              >
                {title || "Configuração da Rota"}
              </button>{" "}
              <span className="text-border-strong">/</span>{" "}
              <span className="font-semibold text-ink">
                Revisão de Sugestões da IA
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent-ai-soft px-2.5 py-1">
              <span className="size-1.5 shrink-0 rounded-full bg-accent-ai" />
              <span className="font-mono text-xs/xs text-purple-stroke">
                POST /api/v1/.../task-suggestions/accept
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 font-sans text-[13px] leading-4 font-semibold text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            {step === 1 ? "✕ Cancelar e Voltar" : "✕ Cancelar e Ir para Dashboard"}
          </Link>
        </div>
      </header>

      {/* Barra de Etapas (Stepper 1/2 e 2/2) */}
      <section className="flex w-full flex-col items-start justify-between gap-6 rounded-lg border border-border bg-surface px-6 py-[18px] tablet:flex-row tablet:items-center">
        {/* Etapa 1 */}
        <button
          type="button"
          onClick={() => setStep(1)}
          className="flex grow basis-0 items-center gap-3.5 text-left"
        >
          <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-primary">
            {step === 1 ? (
              <span className="font-display text-[15px] leading-sm font-bold text-surface">
                1
              </span>
            ) : (
              <Check className="size-[18px] text-icon-mint" strokeWidth={2.5} />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[15px] leading-sm font-bold text-ink">
                Etapa 1 · Rota &amp; Parâmetros
              </span>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] leading-3 font-semibold text-primary">
                {step === 1 ? "EM ANDAMENTO" : "CRIADO (201)"}
              </span>
            </div>
            <span className="font-sans text-sm leading-4 text-ink-muted">
              {step === 1
                ? "Definição de rota, título e teto de data limite"
                : `${origin || "Origem"} → ${destination || "Destino"} · Teto ${movingDate}`}
            </span>
          </div>
        </button>

        <div
          className={cn(
            "hidden h-0.5 w-12 shrink-0 tablet:block",
            step === 1 ? "bg-border-strong" : "bg-accent-ai"
          )}
        />

        {/* Etapa 2 */}
        <button
          type="button"
          disabled={!createdPlanId}
          onClick={() => createdPlanId && setStep(2)}
          className={cn(
            "flex grow basis-0 items-center gap-3.5 text-left transition-opacity",
            step === 1 && "opacity-65"
          )}
        >
          {step === 1 ? (
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border-2 border-dashed border-accent-ai bg-accent-ai-soft">
              <span className="font-display text-[15px] leading-sm font-bold text-accent-ai">
                2
              </span>
            </div>
          ) : (
            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-accent-ai">
              <span className="font-display text-[15px] leading-sm font-bold text-surface">
                2
              </span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "font-display text-[15px] leading-sm font-bold",
                  step === 1 ? "text-ink-secondary" : "text-ink"
                )}
              >
                {step === 1
                  ? "Etapa 2 · Copiloto IA & Lote"
                  : "Etapa 2 · Revisão de Sugestões IA"}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-[10px] leading-3 font-semibold",
                  step === 1
                    ? "bg-surface-subtle text-ink-muted"
                    : "bg-accent-ai-soft text-accent-ai"
                )}
              >
                {step === 1 ? "A SEGUIR" : "SUGESTÕES IA"}
              </span>
            </div>
            <span className="font-sans text-sm leading-4 text-ink-muted">
              {step === 1
                ? "Geração de tarefas personalizadas e aceite atômico"
                : "Selecione, ajuste prazos e confirme o lote no banco"}
            </span>
          </div>
        </button>
      </section>

      {step === 1 ? (
        /* ═══════════════════════════════════════════════════════════════
           ETAPA 1/2 — Rota & Parâmetros IA
           ═══════════════════════════════════════════════════════════════ */
        <div className="flex w-full flex-col items-start gap-6 desktop:flex-row">
          {/* Card Principal do Formulário */}
          <form
            onSubmit={handleAdvanceToStep2}
            className="flex w-full grow basis-0 flex-col gap-6 rounded-xl border border-border bg-surface p-8 shadow-sm"
          >
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[24px] leading-[30px] font-bold tracking-[-0.02em] text-ink">
                Defina a sua Rota de Mudança.
              </h1>
              <p className="font-sans text-base/base text-ink-muted">
                Preencha as informações do seu plano. O Copiloto de IA traçará
                sugestões inteligentes de tarefas com prazos rigorosamente
                calculados antes da sua data limite.
              </p>
            </div>

            {/* Título do Plano */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="plan-title"
                  className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase"
                >
                  TÍTULO DO PLANO *
                </label>
                <span className="font-mono text-xs/xs text-ink-muted">
                  max 100 caracteres ({title.length}/100)
                </span>
              </div>
              <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3 focus-within:border-primary focus-within:bg-canvas">
                <Home className="size-[18px] shrink-0 text-primary" />
                <input
                  id="plan-title"
                  type="text"
                  maxLength={100}
                  placeholder="Ex: Mudança para Lisboa — Ap. 302"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-transparent font-sans text-base/sm font-semibold text-ink outline-none placeholder:text-ink-muted"
                />
              </div>
            </div>

            {/* Origem & Destino */}
            <div className="flex w-full flex-col gap-4 tablet:flex-row">
              <div className="flex grow basis-0 flex-col gap-2">
                <label
                  htmlFor="plan-origin"
                  className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase"
                >
                  CIDADE DE ORIGEM *
                </label>
                <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3 focus-within:border-primary focus-within:bg-canvas">
                  <Navigation className="size-[18px] shrink-0 text-ink-muted" />
                  <input
                    id="plan-origin"
                    type="text"
                    placeholder="Ex: São Paulo, SP (Brasil)"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    className="w-full bg-transparent font-sans text-base/sm text-ink outline-none placeholder:text-ink-muted"
                  />
                </div>
              </div>

              <div className="flex grow basis-0 flex-col gap-2">
                <label
                  htmlFor="plan-destination"
                  className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase"
                >
                  CIDADE DE DESTINO *
                </label>
                <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3 focus-within:border-primary focus-within:bg-canvas">
                  <MapPin className="size-[18px] shrink-0 text-primary" />
                  <input
                    id="plan-destination"
                    type="text"
                    placeholder="Ex: Lisboa (Portugal)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full bg-transparent font-sans text-base/sm font-semibold text-ink outline-none placeholder:text-ink-muted"
                  />
                </div>
              </div>
            </div>

            {/* Data Prevista + Quantidade de Sugestões IA */}
            <div className="flex w-full flex-col gap-4 tablet:flex-row">
              <div className="flex grow basis-0 flex-col gap-2">
                <label className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase">
                  DATA PREVISTA DA MUDANÇA *
                </label>
                <DatePicker
                  value={movingDate}
                  onChange={setMovingDate}
                  ariaLabel="Data prevista da mudança"
                  className="w-full"
                />
                <span className="font-mono text-xs/xs text-ink-secondary">
                  Teto máximo para prazos: {movingDate} ({daysRemaining} dias)
                </span>
              </div>

              <div className="flex grow basis-0 flex-col gap-2">
                <label className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase">
                  SUGESTÕES DA IA
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MAX_SUGGESTIONS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setMaxSuggestions(opt.value)}
                      className={cn(
                        "rounded-md border p-2.5 text-center font-sans text-xs/xs font-semibold transition-colors",
                        maxSuggestions === opt.value
                          ? "border-primary bg-primary-soft text-primary font-bold"
                          : "border-border bg-surface text-ink-secondary hover:bg-surface-subtle"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão de Avanço */}
            <div className="flex items-center justify-end border-t border-border pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-sans text-base/sm font-bold text-surface transition-colors hover:bg-primary-strong disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="size-4 animate-spin text-icon-mint" />
                    <span>Criando Plano...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Plano &amp; Gerar Sugestões IA</span>
                    <ArrowRight className="size-4 text-icon-mint" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Coluna Direita Explicativa */}
          <aside className="flex w-full shrink-0 flex-col gap-5 desktop:w-[360px]">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary-soft">
                  <Star className="size-[18px] text-primary" />
                </div>
                <h2 className="font-display text-md/base font-bold text-ink">
                  Como o Copiloto IA funciona?
                </h2>
              </div>

              <div className="flex flex-col gap-3.5">
                {[
                  [
                    "1",
                    "Análise Geográfica:",
                    "A IA avalia os requisitos consulares e logísticos entre a cidade de origem e destino.",
                  ],
                  [
                    "2",
                    "Prazos Retroativos:",
                    "Tarefas complexas são escalonadas cronologicamente antes da data de mudança informada.",
                  ],
                  [
                    "3",
                    "Revisão Transacional:",
                    "Nenhuma tarefa é gravada no banco antes de você revisar item por item na Etapa 2.",
                  ],
                ].map(([num, bold, text]) => (
                  <div key={num} className="flex items-start gap-2.5">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-canvas">
                      <span className="font-mono text-[10px] leading-3 font-bold text-ink-muted">
                        {num}
                      </span>
                    </div>
                    <p className="font-sans text-sm leading-4 text-ink-secondary">
                      <strong className="font-bold text-ink">{bold}</strong>{" "}
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-subtle p-5 shadow-sm">
              <span className="font-mono text-xs/xs font-bold tracking-[0.05em] text-ink-muted uppercase">
                INFRAESTRUTURA &amp; MOTOR IA
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm leading-4 text-ink-secondary">
                    Motor LLM:
                  </span>
                  <span className="font-mono text-xs leading-4 font-bold text-primary">
                    Ollama · Llama 3.2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm leading-4 text-ink-secondary">
                    Status da API:
                  </span>
                  <span className="font-mono text-xs leading-4 font-semibold text-success">
                    HTTP 200 · localhost:3333
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm leading-4 text-ink-secondary">
                    Persistência:
                  </span>
                  <span className="font-mono text-xs leading-4 font-semibold text-ink">
                    PostgreSQL 16 via Prisma
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           ETAPA 2/2 — Sugestões IA & Confirmação em Lote
           ═══════════════════════════════════════════════════════════════ */
        <>
          {/* Banner Resumo do Plano Criado */}
          <section className="flex w-full flex-wrap items-center justify-between gap-4 rounded-lg bg-primary px-6 py-[18px]">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-success bg-primary-strong">
                <Home className="size-6 text-icon-mint" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-[18px] leading-[22px] font-bold tracking-[-0.01em] text-surface">
                    {title}
                  </h1>
                  <span className="rounded-full border border-success bg-primary-strong px-2 py-0.5 font-mono text-[10px] leading-3 font-semibold text-icon-mint">
                    PLANO ID: #{createdPlanId ? createdPlanId.slice(0, 8) : "NOVO"}
                  </span>
                </div>
                <p className="font-sans text-[13px] leading-4 text-border">
                  {origin} <span className="text-icon-mint">→</span> {destination}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-xs/xs tracking-[0.05em] text-icon-mint uppercase">
                DATA DA MUDANÇA (TETO RÍGIDO)
              </span>
              <span className="font-display text-md/base font-bold text-surface">
                {movingDate} ({daysRemaining} dias)
              </span>
            </div>
          </section>

          {/* Grid Principal: Lista de Sugestões (Esquerda) + Aceite em Lote (Direita) */}
          <div className="flex w-full flex-col items-start gap-6 desktop:flex-row">
            {/* Lista de Sugestões Geradas pelo Copiloto */}
            <section className="flex w-full grow basis-0 flex-col gap-4 rounded-xl border border-border bg-surface p-7 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display text-lg/md font-bold tracking-[-0.01em] text-ink">
                      Sugestões Geradas pelo Copiloto IA.
                    </h2>
                    <p className="font-sans text-[13px] leading-4 text-ink-muted">
                      Revise os itens sugeridos. Ajuste as datas limites conforme
                      necessário e desmarque os que não se aplicam à sua mudança.
                    </p>
                  </div>
                  <span className="rounded-full border border-accent-ai bg-accent-ai-soft px-2.5 py-1 font-mono text-xs/xs font-semibold text-purple-stroke">
                    {selectedCount} DE {suggestions.length} SELECIONADAS
                  </span>
                </div>
              </div>

              {/* Estado de Carregamento da IA */}
              {isGeneratingAi && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-purple-stroke/50 bg-accent-ai-soft/30 p-12 text-center">
                  <Sparkles className="size-8 animate-spin text-accent-ai" />
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-base/sm font-bold text-purple-stroke">
                      O Copiloto IA está analisando sua rota...
                    </span>
                    <span className="font-sans text-xs/xs text-ink-muted">
                      Identificando burocracias aduaneiras, prazos consulares e cronograma logístico.
                    </span>
                  </div>
                </div>
              )}

              {/* Linhas de Sugestões Reais */}
              {!isGeneratingAi && suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-subtle p-8 text-center">
                  <span className="font-sans text-sm text-ink-muted">
                    Nenhuma sugestão retornada no momento.
                  </span>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-xs/xs font-bold text-surface"
                  >
                    <RefreshCw className="size-3.5" />
                    Tentar Gerar Novamente
                  </button>
                </div>
              )}

              {!isGeneratingAi && suggestions.length > 0 && (
                <div className="flex flex-col gap-3.5">
                  {suggestions.map((item) => {
                    const isInvalid =
                      item.selected && item.dueDate > movingDate

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex w-full flex-wrap items-center gap-3.5 rounded-[12px] px-[18px] py-3.5 transition-all tablet:flex-nowrap",
                          item.selected
                            ? "border-[1.5px] border-accent-ai-soft bg-surface shadow-xs"
                            : "border border-dashed border-border-strong bg-surface opacity-75"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSuggestion(item.id)}
                          aria-label={`Selecionar ${item.title}`}
                          className={cn(
                            "flex size-[22px] shrink-0 items-center justify-center rounded-sm transition-colors",
                            item.selected
                              ? "bg-accent-ai text-surface"
                              : "border-2 border-border-strong bg-surface"
                          )}
                        >
                          {item.selected && (
                            <Check className="size-3.5" strokeWidth={3} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleSuggestion(item.id)}
                          className="flex min-w-0 grow basis-0 flex-col gap-[3px] text-left"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "font-sans text-base/sm",
                                item.selected
                                  ? "font-bold text-ink"
                                  : "font-semibold text-ink-secondary"
                              )}
                            >
                              {item.title}
                            </span>
                          </div>
                          <span className="font-sans text-sm leading-4 text-ink-muted">
                            {item.selected
                              ? item.description || "Sem descrição adicional"
                              : "Item desmarcado: não será persistido na confirmação do lote."}
                          </span>
                        </button>

                        <DatePicker
                          variant="compact"
                          align="end"
                          value={item.dueDate}
                          maxDate={movingDate}
                          invalid={isInvalid}
                          onChange={(nextDate) =>
                            handleChangeSuggestionDate(item.id, nextDate)
                          }
                          ariaLabel={`Prazo para ${item.title}`}
                          className={cn(!item.selected && "opacity-60")}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Coluna Direita: Aceite em Lote + Garantia Transacional */}
            <aside className="flex w-full shrink-0 flex-col gap-5 desktop:w-[360px]">
              <div className="flex flex-col gap-[18px] rounded-xl border-[1.5px] border-accent-ai bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="size-5 text-accent-ai" />
                    <h3 className="font-display text-md/base font-bold text-ink">
                      Aceite em Lote
                    </h3>
                  </div>
                  <span className="rounded-sm bg-accent-ai-soft px-2 py-[3px] font-mono text-xs/xs font-bold text-purple-stroke">
                    PRISMA $TX
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 rounded-md border border-border bg-canvas/60 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[13px] leading-4 text-ink-muted">
                      Tarefas para gravar:
                    </span>
                    <span className="font-mono text-base/sm font-bold text-ink">
                      {selectedCount} itens
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[13px] leading-4 text-ink-muted">
                      Status inicial:
                    </span>
                    <span className="rounded-[4px] bg-surface-subtle px-1.5 py-0.5 font-mono text-xs/xs font-bold text-ink-secondary">
                      TODO
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[13px] leading-4 text-ink-muted">
                      Validação de data:
                    </span>
                    <span
                      className={cn(
                        "font-sans text-sm leading-4 font-bold",
                        hasInvalidDate ? "text-danger" : "text-success"
                      )}
                    >
                      {hasInvalidDate
                        ? "✕ Prazo fora do teto"
                        : "✓ Todas válidas"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting || selectedCount === 0 || hasInvalidDate}
                    onClick={handleConfirmBatch}
                    className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-sans text-[13px] leading-4 font-bold text-surface transition-colors hover:bg-primary-strong disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="size-4 animate-spin text-icon-mint" />
                        <span>Gravando no Banco...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar e Criar Lote ({selectedCount})</span>
                        <Check
                          className="size-4 text-icon-mint"
                          strokeWidth={2.5}
                        />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={handleRegenerate}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2.5 font-sans text-[13px] leading-4 font-semibold text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink disabled:opacity-50"
                  >
                    <RefreshCw
                      className={cn("size-3.5", isGeneratingAi && "animate-spin text-primary")}
                    />
                    <span>Regenerar Sugestões ({remainingQuota} rest.)</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Shield className="size-[18px] text-primary" />
                  <h3 className="font-display text-base/sm font-bold text-ink">
                    Garantia Transacional
                  </h3>
                </div>
                <p className="font-sans text-sm/sm text-ink-secondary">
                  A gravação do lote é atômica via{" "}
                  <span className="font-mono text-xs font-semibold text-ink">
                    prisma.$transaction
                  </span>
                  . Todas as tarefas são validadas pelo backend antes da persistência.
                </p>
                <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                  <span className="font-mono text-xs/xs text-ink-muted">
                    Endpoint atômico:
                  </span>
                  <span className="font-mono text-xs/xs font-semibold text-ink">
                    POST /api/v1/moving-plans/:id/task-suggestions/accept
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </main>
  )
}
