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
import { api } from "@/lib/api/client"
import {
  BERLIN_STEP2_SUGGESTIONS,
  type CopilotSuggestion,
} from "@/lib/mock-data"

const MAX_SUGGESTIONS_OPTIONS = [
  { value: 5, label: "5 tarefas" },
  { value: 10, label: "10 tarefas (Recomendado)" },
  { value: 15, label: "15 tarefas" },
  { value: 20, label: "20 (Máx)" },
] as const

export function NewPlanWizard({ initialStep = 1 }: { initialStep?: 1 | 2 }) {
  const router = useRouter()
  const { createNewPlan } = useWorkspaceStore()
  const [step, setStep] = React.useState<1 | 2>(initialStep)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [createdPlanId, setCreatedPlanId] = React.useState<string | null>(null)

  // Etapa 1 — Parâmetros do Plano
  const [title, setTitle] = React.useState("Mudança para Berlim — Kreuzberg")
  const [origin, setOrigin] = React.useState("São Paulo, SP (Brasil)")
  const [destination, setDestination] = React.useState(
    "Berlim, Mitte (Alemanha)"
  )
  const [movingDate, setMovingDate] = React.useState("2027-01-15")
  const [maxSuggestions, setMaxSuggestions] = React.useState<number>(10)

  // Etapa 2 — Sugestões em Memória
  const [suggestions, setSuggestions] = React.useState<CopilotSuggestion[]>(
    BERLIN_STEP2_SUGGESTIONS
  )
  const [remainingQuota, setRemainingQuota] = React.useState(4)

  const selectedCount = suggestions.filter((s) => s.selected).length
  const visibleSuggestions = suggestions.slice(0, 6)

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
        title,
        origin,
        destination,
        movingDate,
      })
      setCreatedPlanId(plan.id)
      setStep(2)
      toast.success(
        "Plano criado (201) e sugestões geradas em memória pelo Copiloto IA."
      )
    } catch {
      setStep(2)
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

  function handleRegenerate() {
    if (remainingQuota <= 0) {
      toast.error(
        "Limite de requisições excedido (HTTP 429 · máx. 5 req/min por IP)."
      )
      return
    }
    setRemainingQuota((q) => q - 1)
    setSuggestions((prev) =>
      prev.map((s, idx) => ({
        ...s,
        selected: idx !== 4 && idx !== 8,
      }))
    )
    toast.success("Sugestões regeneradas em memória.")
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
      try {
        await api.suggestions.accept(createdPlanId, { tasks: selectedTasks })
      } catch {
        // Enfileiramento/fallback pelo store
      }
    }

    toast.success(
      `Lote de ${selectedCount} tarefas gravado atomicamente via prisma.$transaction (201 Created)!`
    )
    router.push("/")
  }

  return (
    <main className="flex grow basis-0 flex-col gap-6 bg-canvas px-6 py-8 desktop:px-9">
      {/* Topbar Breadcrumb + Endpoint + Cancelar */}
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        {step === 1 ? (
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="font-sans text-[13px] leading-4 font-medium text-ink-muted">
              <Link href="/" className="hover:text-ink">
                Meus Planos de Mudança
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
                Meus Planos
              </Link>{" "}
              <span className="text-border-strong">/</span>{" "}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-ink"
              >
                Mudança para Berlim
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
            {step === 1 ? "✕ Cancelar e Voltar" : "✕ Cancelar e Descartar"}
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
                : `São Paulo → Berlim · Teto ${movingDate}`}
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
          onClick={() => setStep(2)}
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
                {step === 1 ? "A SEGUIR" : "EM MEMÓRIA"}
              </span>
            </div>
            <span className="font-sans text-sm leading-4 text-ink-muted">
              {step === 1
                ? "Geração prévia de tarefas e aceite atômico"
                : "Selecione, ajuste prazos e confirme o lote atômico"}
            </span>
          </div>
        </button>
      </section>

      {step === 1 ? (
        /* ═══════════════════════════════════════════════════════════════
           ETAPA 1/2 — Rota & Parâmetros IA (Paper Artboard 11G-0)
           ═══════════════════════════════════════════════════════════════ */
        <div className="flex w-full flex-col items-start gap-6 desktop:flex-row">
          {/* Card Principal do Formulário */}
          <form
            onSubmit={handleAdvanceToStep2}
            className="flex w-full grow basis-0 flex-col gap-6 rounded-xl border border-border bg-surface p-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[24px] leading-[30px] font-bold tracking-[-0.02em] text-ink">
                Defina a sua Rota de Mudança.
              </h1>
              <p className="font-sans text-base/base text-ink-muted">
                Preencha as coordenadas do seu plano. Na sequência, o copiloto
                de IA traçará sugestões inteligentes de tarefas com prazos
                rigorosamente limitados à sua data de mudança.
              </p>
            </div>

            {/* Título do Plano */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="plan-title"
                  className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase"
                >
                  TÍTULO DO PLANO
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent font-sans text-base/sm font-semibold text-ink outline-none"
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
                  CIDADE DE ORIGEM
                </label>
                <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3 focus-within:border-primary focus-within:bg-canvas">
                  <Navigation className="size-[18px] shrink-0 text-ink-muted" />
                  <input
                    id="plan-origin"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-transparent font-sans text-base/sm text-ink outline-none"
                  />
                </div>
              </div>

              <div className="flex grow basis-0 flex-col gap-2">
                <label
                  htmlFor="plan-destination"
                  className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase"
                >
                  CIDADE DE DESTINO
                </label>
                <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface px-4 py-3 focus-within:border-primary focus-within:bg-canvas">
                  <MapPin className="size-[18px] shrink-0 text-primary" />
                  <input
                    id="plan-destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-transparent font-sans text-base/sm font-semibold text-ink outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Data da Mudança (Moving Date) com DatePicker do Design System */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="plan-moving-date"
                  className="font-sans text-sm leading-4 font-bold tracking-[0.04em] text-ink uppercase"
                >
                  DATA DA MUDANÇA (MOVING DATE)
                </label>
                <span className="font-mono text-xs/xs font-semibold text-primary">
                  YYYY-MM-DD · Teto Estrito
                </span>
              </div>

              <DatePicker
                id="plan-moving-date"
                variant="field"
                value={movingDate}
                onChange={setMovingDate}
                trailingBadge={
                  <span className="rounded-sm bg-primary-soft px-2 py-[3px] font-sans text-xs/xs font-semibold text-primary">
                    FALTAM 74 DIAS
                  </span>
                }
              />

              <p className="font-sans text-sm leading-4 text-ink-muted">
                O backend rejeitará com HTTP 400 qualquer tarefa com prazo
                posterior a este dia.
              </p>
            </div>

            {/* Painel Copiloto IA · Geração de Sugestões */}
            <div className="flex flex-col gap-3.5 rounded-lg border-[1.5px] border-accent-ai bg-accent-ai-soft p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-[18px] shrink-0 text-accent-ai" />
                  <span className="font-display text-base/sm font-bold text-purple-stroke">
                    Copiloto IA · Geração de Sugestões
                  </span>
                </div>
                <span className="rounded-full border border-accent-ai bg-surface px-2 py-[3px] font-mono text-[10px] leading-3 font-semibold text-accent-ai">
                  RATE LIMIT: 5 REQ/MIN
                </span>
              </div>

              <p className="font-sans text-[13px] leading-sm text-purple-stroke">
                Ao avançar, o modelo estruturado da OpenAI / Ollama processará a
                rota e trará tarefas contextuais sem gravar no banco até sua
                confirmação.
              </p>

              <div className="flex flex-col gap-2">
                <span className="font-mono text-xs/xs font-bold text-purple-stroke uppercase">
                  QUANTIDADE DE SUGESTÕES (maxSuggestions):
                </span>
                <div className="flex flex-wrap gap-2">
                  {MAX_SUGGESTIONS_OPTIONS.map((opt) => {
                    const active = maxSuggestions === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMaxSuggestions(opt.value)}
                        className={cn(
                          "rounded-[8px] px-3.5 py-1.5 font-sans text-sm leading-4 transition-colors",
                          active
                            ? "bg-accent-ai font-bold text-surface"
                            : "border border-border bg-surface font-semibold text-ink-secondary hover:text-ink"
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Rodapé do Formulário */}
            <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <span className="font-mono text-xs/xs text-ink-muted">
                Campos validados por class-validator
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-md border border-border bg-surface px-[18px] py-2.5 font-sans text-[13px] leading-4 font-semibold text-ink-secondary transition-colors hover:bg-surface-subtle"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-md bg-primary px-[22px] py-2.5 font-sans text-[13px] leading-4 font-bold text-surface transition-colors hover:bg-primary-strong disabled:opacity-50"
                >
                  {isSubmitting ? "Criando plano..." : "Salvar Plano & Gerar com IA"}
                  <ArrowRight className="size-4 text-icon-mint" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </form>

          {/* Coluna Direita Explicativa */}
          <aside className="flex w-full shrink-0 flex-col gap-5 desktop:w-[360px]">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary-soft">
                  <Star className="size-[18px] text-primary" />
                </div>
                <h2 className="font-display text-md/base font-bold text-ink">
                  Como a IA te ajuda?
                </h2>
              </div>

              <div className="flex flex-col gap-3.5">
                {[
                  [
                    "1",
                    "Mapeamento Geográfico:",
                    "A IA reconhece particularidades entre Brasil e Alemanha (visas, Anmeldung, bancos).",
                  ],
                  [
                    "2",
                    "Prazos Retroativos:",
                    "Tarefas complexas são escalonadas em ordem cronológica antes do dia 15/01/2027.",
                  ],
                  [
                    "3",
                    "Sem Poluição do Banco:",
                    "Nada é gravado na sua conta antes de você revisar item por item na Etapa 2.",
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

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-subtle p-5">
              <span className="font-mono text-xs/xs font-bold tracking-[0.05em] text-ink-muted uppercase">
                INTEGRIDADE &amp; TELEMETRIA
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm leading-4 text-ink-secondary">
                    Timeout da IA:
                  </span>
                  <span className="font-mono text-sm leading-4 font-semibold text-ink">
                    15.000 ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm leading-4 text-ink-secondary">
                    Rate Limit / IP:
                  </span>
                  <span className="font-mono text-sm leading-4 font-semibold text-ink">
                    5 req / min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm leading-4 text-ink-secondary">
                    LLM Providers:
                  </span>
                  <span className="font-mono text-sm leading-4 font-semibold text-primary">
                    OpenAI · Ollama
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════════════════
           ETAPA 2/2 — Sugestões IA & Confirmação em Lote (Artboard 17N-0)
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
                    PLANO ID: #mp-berlin-01
                  </span>
                </div>
                <p className="font-sans text-[13px] leading-4 text-border">
                  {origin} <span className="text-icon-mint">→</span>{" "}
                  {destination}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-0.5">
              <span className="font-mono text-xs/xs tracking-[0.05em] text-icon-mint uppercase">
                DATA DA MUDANÇA (TETO RÍGIDO)
              </span>
              <span className="font-display text-md/base font-bold text-surface">
                {movingDate} (Faltam 74 dias)
              </span>
            </div>
          </section>

          {/* Grid Principal: Lista de Sugestões (Esquerda) + Aceite em Lote (Direita) */}
          <div className="flex w-full flex-col items-start gap-6 desktop:flex-row">
            {/* Lista de Sugestões Geradas pelo Copiloto */}
            <section className="flex w-full grow basis-0 flex-col gap-4 rounded-xl border border-border bg-surface p-7">
              <div className="flex flex-col gap-3 border-b border-border pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display text-lg/md font-bold tracking-[-0.01em] text-ink">
                      Sugestões Geradas pelo Copiloto.
                    </h2>
                    <p className="font-sans text-[13px] leading-4 text-ink-muted">
                      Ajuste prazos e desmarque as tarefas que não fizerem
                      sentido para o seu caso.
                    </p>
                  </div>
                  <span className="rounded-full border border-accent-ai bg-accent-ai-soft px-2.5 py-1 font-mono text-xs/xs font-semibold text-purple-stroke">
                    {selectedCount} DE {suggestions.length} SELECIONADAS
                  </span>
                </div>
              </div>

              {/* Linhas de Sugestões */}
              <div className="flex flex-col gap-3.5">
                {visibleSuggestions.map((item) => {
                  const isInvalid =
                    item.selected && item.dueDate > movingDate

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex w-full flex-wrap items-center gap-3.5 rounded-[12px] px-[18px] py-3.5 transition-all tablet:flex-nowrap",
                        item.selected
                          ? "border-[1.5px] border-accent-ai-soft bg-surface"
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
                          {item.category && (
                            <span className="shrink-0 rounded-[4px] bg-surface-subtle px-2 py-0.5 font-mono text-[10px] leading-3 font-semibold text-ink-muted">
                              {item.category}
                            </span>
                          )}
                        </div>
                        <span className="font-sans text-sm leading-4 text-ink-muted">
                          {item.selected
                            ? item.description
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
            </section>

            {/* Coluna Direita: Aceite em Lote + Garantia Transacional */}
            <aside className="flex w-full shrink-0 flex-col gap-5 desktop:w-[360px]">
              <div className="flex flex-col gap-[18px] rounded-xl border-[1.5px] border-accent-ai bg-surface p-6">
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
                    onClick={handleConfirmBatch}
                    className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-sans text-[13px] leading-4 font-bold text-surface transition-colors hover:bg-primary-strong"
                  >
                    Confirmar e Criar Lote ({selectedCount})
                    <Check
                      className="size-4 text-icon-mint"
                      strokeWidth={2.5}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2.5 font-sans text-[13px] leading-4 font-semibold text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink"
                  >
                    <RefreshCw className="size-3.5" />
                    Regenerar Sugestões ({remainingQuota} rest.)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2">
                  <Shield className="size-[18px] text-primary" />
                  <h3 className="font-display text-base/sm font-bold text-ink">
                    Garantia Transacional
                  </h3>
                </div>
                <p className="font-sans text-sm/sm text-ink-secondary">
                  A gravação do lote é atômica via{" "}
                  <span className="font-mono text-xs">
                    prisma.$transaction
                  </span>
                  . Se qualquer item violar regras de prazo ou formato, o lote
                  inteiro sofre rollback sem deixar dados parciais.
                </p>
                <div className="flex flex-col gap-1.5 border-t border-border pt-2.5">
                  <span className="font-mono text-xs/xs text-ink-muted">
                    Payload verificado por:
                  </span>
                  <span className="font-mono text-xs/xs font-semibold text-ink">
                    TaskSuggestionsValidator
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
