import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Pílulas de status — Paper · "03 · Status Badges (TaskStatus)".
 * Cada pílula aplica a mesma dupla Stroke + Fill da iconografia duotone.
 *
 * - `appearance="soft"`  → pílula com ponto (painel de status, banners).
 * - `appearance="solid"` → pílula preenchida de largura fixa (checklist).
 */
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border-[1.5px] border-transparent px-3.5 py-1.5 font-mono text-xs font-bold whitespace-nowrap uppercase transition-all focus-visible:ring-[3px] focus-visible:ring-ring/30 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground",
        secondary: "bg-surface-subtle text-ink",
        outline: "border-border-strong bg-surface text-ink",
        destructive: "border-danger bg-danger-soft text-danger",
        /* TaskStatus */
        todo: "border-ink text-ink",
        in_progress: "border-danger text-danger",
        done: "border-primary text-primary",
        /* Prévia do Copiloto IA (em memória) */
        ai: "border-purple-stroke text-purple-stroke",
      },
      appearance: {
        soft: "",
        solid: "",
      },
    },
    compoundVariants: [
      { variant: "todo", appearance: "soft", className: "bg-surface" },
      { variant: "todo", appearance: "solid", className: "bg-surface-subtle" },
      { variant: "in_progress", appearance: "soft", className: "bg-danger-soft" },
      { variant: "in_progress", appearance: "solid", className: "bg-pink-main" },
      { variant: "done", appearance: "soft", className: "bg-primary-soft" },
      { variant: "done", appearance: "solid", className: "bg-icon-mint" },
      { variant: "ai", appearance: "soft", className: "bg-accent-ai-soft" },
      { variant: "ai", appearance: "solid", className: "bg-accent-ai" },
    ],
    defaultVariants: {
      variant: "default",
      appearance: "soft",
    },
  }
)

/** Cor do ponto indicador para os variantes de status (modo `soft`). */
const badgeDotVariants = cva("size-2 shrink-0 rounded-full", {
  variants: {
    variant: {
      todo: "bg-ink",
      in_progress: "border-[1.2px] border-danger bg-pink-main",
      done: "border-[1.2px] border-primary bg-icon-mint",
      ai: "border-[1.2px] border-purple-stroke bg-accent-ai",
    },
  },
})

type StatusVariant = NonNullable<VariantProps<typeof badgeDotVariants>["variant"]>

function isStatusVariant(v: unknown): v is StatusVariant {
  return v === "todo" || v === "in_progress" || v === "done" || v === "ai"
}

function Badge({
  className,
  variant = "default",
  appearance = "soft",
  dot,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    /** Exibe o ponto indicador (padrão: true em status `soft`). */
    dot?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "span"
  const showDot =
    !asChild && isStatusVariant(variant) && (dot ?? appearance === "soft")

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, appearance }), className)}
      {...props}
    >
      {showDot && (
        <span aria-hidden className={badgeDotVariants({ variant })} />
      )}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
