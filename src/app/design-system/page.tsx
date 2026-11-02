import type { Metadata } from "next"

import {
  AlertCircleIcon,
  CopilotCupIcon,
  CopilotIcon,
  HomeAddIcon,
  HomeIcon,
  PackageIcon,
  PlusCircleIcon,
  PlusSquareIcon,
  ShieldClockIcon,
  SparkleIcon,
  TrashIcon,
  TruckIcon,
  UtilitiesIcon,
} from "@/components/icons/duotone"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const metadata: Metadata = { title: "Design System" }

const colors = [
  ["Warm Sand Canvas", "--color-canvas", "bg-canvas"],
  ["Cream Surface", "--color-surface", "bg-surface"],
  ["Nested Sand", "--color-surface-subtle", "bg-surface-subtle"],
  ["Pure Ink", "--color-ink", "bg-ink"],
  ["Dark Forest Green", "--color-primary", "bg-primary"],
  ["Main Acid Lime", "--color-icon-mint", "bg-icon-mint"],
  ["Main Purple IA", "--color-accent-ai", "bg-accent-ai"],
  ["Dark Magenta", "--color-danger", "bg-danger"],
] as const

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-display text-lg/md font-bold text-ink">{children}</h2>
      {hint && <p className="font-mono text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex w-full max-w-(--container-xl) flex-col gap-9 px-6 py-12 tablet:px-12">
      <header className="flex flex-col gap-1.5 border-b pb-6">
        <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-primary uppercase">
          Design System v1.0 · Botanical Calm
        </span>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          LifePilot AI — Fundamentos Visuais
        </h1>
        <p className="max-w-(--container-md) text-base text-ink-secondary">
          Tokens e componentes sincronizados com o arquivo do Paper. Esta página serve de
          referência viva para validar o tema shadcn/ui.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="Contraste WCAG AAA · bordas de 1px sem sombras pesadas">
          01 · Cores &amp; Superfícies
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4 desktop:grid-cols-8">
          {colors.map(([name, token, bg]) => (
            <div key={token} className="flex flex-col gap-2 rounded-lg border bg-surface p-3">
              <div className={`h-12 rounded-md border ${bg}`} />
              <p className="text-sm font-semibold text-ink">{name}</p>
              <p className="font-mono text-xs text-ink-muted">{token}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="Bricolage Grotesque · Plus Jakarta Sans · JetBrains Mono">
          02 · Tipografia
        </SectionTitle>
        <div className="grid gap-4 tablet:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="font-mono text-xs font-semibold text-primary uppercase">Display · 700–800</p>
              <p className="font-display text-xl font-extrabold tracking-tight">
                Planeje cada passo da sua nova casa sem estresse.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="font-mono text-xs font-semibold text-primary uppercase">Interface · 400–600</p>
              <p className="text-md font-semibold">Checklist estruturado para decisões rápidas.</p>
              <p className="text-base text-ink-secondary">Alta legibilidade em telas densas.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <p className="font-mono text-xs font-semibold text-accent-ai uppercase">Data &amp; Status</p>
              <p className="font-mono text-lg">2026-12-15 · IN_PROGRESS</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="Contorno 1.8px + fill principal + fill secundário">
          03 · Iconografia Duotone
        </SectionTitle>
        <div className="flex flex-wrap gap-3 rounded-xl bg-surface-subtle p-5">
          {[
            [PackageIcon, "Empacotamento"],
            [CopilotIcon, "Copiloto IA"],
            [TruckIcon, "Frete & Rota"],
            [UtilitiesIcon, "Água & Energia"],
            [HomeIcon, "Novo Lar"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof PackageIcon
            return (
              <div key={label as string} className="flex items-center gap-3 rounded-full bg-surface py-2.5 pr-5.5 pl-3.5">
                <I />
                <span className="text-md font-bold">{label as string}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="Altura 42px (MD) · 34px (SM) · pílulas">
          04 · Botões
        </SectionTitle>
        <div className="flex flex-wrap items-center gap-3.5 rounded-xl bg-surface-subtle px-6 py-5">
          <Button>
            <PlusSquareIcon data-icon="inline-start" />
            Criar Plano de Mudança
          </Button>
          <Button variant="ai">
            <SparkleIcon data-icon="inline-start" />
            Gerar Sugestões com IA
          </Button>
          <Button variant="outline">
            <PlusCircleIcon data-icon="inline-start" />
            Nova Tarefa
          </Button>
          <Button variant="destructive">
            <TrashIcon data-icon="inline-start" />
            Eliminar
          </Button>
          <Button variant="outline" size="sm">Descartar</Button>
          <Button variant="ai-solid" size="sm">Aceitar Lote (2)</Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="CreateMovingPlanDto · CreateTaskDto · dueDate ≤ movingDate">
          05 · Formulários
        </SectionTitle>
        <div className="grid gap-4 tablet:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="title">Título do Plano *</Label>
              <Input id="title" defaultValue="Mudança para Lisboa — Ap. 302" maxLength={100} />
              <p className="text-xs text-ink-muted">Obrigatório · máximo de 100 caracteres.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="due">Prazo da Tarefa</Label>
              <Input id="due" defaultValue="2026-11-25" className="font-mono font-semibold" />
              <p className="text-xs text-primary">Válido: 20 dias antes de movingDate (2026-12-15).</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Label htmlFor="due-invalid" className="text-danger">Prazo Inválido (400)</Label>
              <Input id="due-invalid" aria-invalid defaultValue="2026-12-20" className="font-mono font-semibold" />
              <p className="text-xs text-danger">O prazo não pode ser posterior à data da mudança.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="@nestjs/throttler · timeout de IA 15000ms">
          06 · Status &amp; Resiliência da IA
        </SectionTitle>
        <div className="grid gap-4 desktop:grid-cols-[460px_1fr]">
          <div className="flex flex-col gap-3.5 rounded-xl bg-surface-subtle p-5.5">
            <p className="font-display text-[18px] leading-[22px] font-extrabold">Pílulas de Status</p>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="todo">TODO</Badge>
              <Badge variant="in_progress">IN_PROGRESS</Badge>
              <Badge variant="done">DONE</Badge>
              <Badge variant="ai">Prévia IA (em memória)</Badge>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Badge variant="done" appearance="solid" className="w-28">DONE</Badge>
              <Badge variant="in_progress" appearance="solid" className="w-28">IN_PROGRESS</Badge>
              <Badge variant="todo" appearance="solid" className="w-28">TODO</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Alert variant="ai">
              <ShieldClockIcon />
              <AlertTitle>Limite de requisições excedido. Tente novamente em instantes.</AlertTitle>
              <AlertDescription>Máx. 5 gerações de IA/min por IP. Operações CRUD continuam livres.</AlertDescription>
              <AlertAction>
                <Badge variant="ai" dot={false} className="bg-surface">HTTP 429</Badge>
              </AlertAction>
            </Alert>
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Serviço de IA temporariamente indisponível (15s)</AlertTitle>
              <AlertDescription>Nenhuma sugestão parcial foi persistida.</AlertDescription>
              <AlertAction>
                <Badge variant="destructive" className="bg-surface">HTTP 503 / 504</Badge>
              </AlertAction>
            </Alert>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle hint="Hero cards · checklist · Human-in-the-Loop">
          07 · Cards do Domínio
        </SectionTitle>
        <div className="grid gap-6 desktop:grid-cols-[1fr_560px]">
          <div className="flex items-center gap-7 rounded-xl bg-primary py-5.5 pr-7 pl-5.5">
            <div className="flex size-35 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
              <HomeAddIcon />
            </div>
            <div className="flex grow flex-col gap-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-icon-mint px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                  MUDANÇA ATIVA · FALTAM 47 DIAS
                </span>
                <span className="font-mono text-sm text-primary-soft">2026-12-15</span>
              </div>
              <p className="font-display text-[34px] leading-[36px] font-extrabold tracking-tight text-icon-mint">
                Mudança para Lisboa — Ap. 302.
              </p>
              <p className="text-base/sm font-semibold text-primary-soft">
                São Paulo, BR → Lisboa, PT · 64% concluído (9/14)
              </p>
            </div>
          </div>
          <Card className="flex-row items-center gap-7 border-0 px-8">
            <CopilotCupIcon />
            <CardHeader className="grow px-0">
              <CardTitle className="text-[32px] leading-xl">Pausas &amp; IA Reduzem o Estresse.</CardTitle>
              <CardDescription>
                Gere até 20 sugestões de tarefas personalizadas e aprove o lote com total controle.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div className="flex flex-col gap-3 rounded-xl bg-surface-subtle p-6">
          {[
            ["Contratar container marítimo 20ft", "Seguro porta-a-porta confirmado", "2026-11-05", "done", true],
            ["Apostilar documentos civis e contrato", "Cartório do 4º Subdistrito · 5 dias úteis", "2026-11-18", "in_progress", false],
            ["Etiquetar caixas frágeis da cozinha", "Separar itens essenciais da primeira noite", "2026-12-02", "todo", false],
          ].map(([title, desc, date, status, checked]) => (
            <label
              key={title as string}
              className="flex items-center gap-4 rounded-full bg-surface py-3 pr-5 pl-4"
            >
              <Checkbox defaultChecked={checked as boolean} />
              <span className="flex grow flex-col gap-0.5">
                <span className="text-md/base font-bold">{title as string}</span>
                <span className="text-sm text-ink-secondary">{desc as string}</span>
              </span>
              <span className="w-22 shrink-0 text-right font-mono text-sm text-ink-secondary">{date as string}</span>
              <Badge
                variant={status as "done" | "in_progress" | "todo"}
                appearance="solid"
                className="w-28"
              >
                {(status as string).toUpperCase()}
              </Badge>
            </label>
          ))}
        </div>
      </section>
    </main>
  )
}
