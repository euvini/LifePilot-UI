import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-md border border-input bg-surface px-3.5 py-[11px] font-sans text-base font-medium text-ink transition-[color,background-color,border-color,box-shadow] outline-none placeholder:font-normal placeholder:text-ink-muted focus-visible:border-primary focus-visible:bg-canvas focus-visible:ring-[0.5px] focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-(--opacity-muted) aria-invalid:border-danger aria-invalid:bg-danger-soft aria-invalid:text-danger aria-invalid:ring-[0.5px] aria-invalid:ring-danger",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
