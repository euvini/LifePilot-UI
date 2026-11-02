import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Botões — Paper · "02 · Base Components" › "01 · Hierarquia de Botões".
 * Pílulas com contorno de 1.8px (fórmula duotone Wellhub), altura padrão
 * 42px (MD) e 34px (SM).
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border-[1.8px] border-transparent bg-clip-padding font-sans font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-(--opacity-muted) aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        /** "Criar Plano de Mudança" — ação primária. */
        default:
          "border-primary bg-primary text-primary-foreground hover:border-primary-strong hover:bg-primary-strong",
        /** "Gerar Sugestões com IA" — gatilhos do Copiloto. */
        ai: "border-purple-stroke bg-accent-ai-soft text-purple-stroke hover:bg-[color-mix(in_oklab,var(--color-accent-ai-soft),var(--color-accent-ai)_18%)] focus-visible:ring-accent-ai/40",
        /** "Aceitar Lote" — confirmação da revisão de IA. */
        "ai-solid":
          "border-purple-stroke bg-purple-stroke text-surface hover:bg-[color-mix(in_oklab,var(--color-purple-stroke),black_20%)] focus-visible:ring-accent-ai/40",
        /** "Nova Tarefa" — ação secundária neutra. */
        outline:
          "border-ink bg-surface text-ink hover:bg-surface-subtle aria-expanded:bg-surface-subtle",
        secondary:
          "bg-surface-subtle text-ink hover:bg-[color-mix(in_oklab,var(--color-surface-subtle),var(--color-ink)_6%)] aria-expanded:bg-surface-subtle",
        /** "Eliminar" — ações destrutivas. */
        destructive:
          "border-danger bg-danger-soft text-danger hover:bg-[color-mix(in_oklab,var(--color-danger-soft),var(--color-pink-main)_20%)] focus-visible:ring-danger/20",
        ghost:
          "text-ink hover:bg-surface-subtle aria-expanded:bg-surface-subtle",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-[42px] gap-2.5 px-5 text-[15px] leading-[20px] has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        sm: "h-[34px] gap-2 px-4 text-[13px] leading-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 gap-3 px-[22px] text-[15px] leading-[20px] has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-6",
        icon: "size-[42px]",
        "icon-sm": "size-[34px] [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
