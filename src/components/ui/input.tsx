import * as React from "react"
import { cn } from "cn"

/**
 * Input — Paper · "02 · Formulários, Inputs & Validação Estrita de Prazos".
 * Repouso: surface + border-strong · Foco: canvas + borda primary 1.5px ·
 * Erro (aria-invalid): danger-soft + borda danger 1.5px.
 * Para datas (YYYY-MM-DD) use `className="font-mono font-semibold"`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-surface px-3.5 py-[11px] font-sans text-base font-medium text-ink transition-[color,background-color,border-color,box-shadow] outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:font-normal placeholder:text-ink-muted focus-visible:border-primary focus-visible:bg-canvas focus-visible:ring-[0.5px] focus-visible:ring-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-(--opacity-muted) aria-invalid:border-danger aria-invalid:bg-danger-soft aria-invalid:text-danger aria-invalid:ring-[0.5px] aria-invalid:ring-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
