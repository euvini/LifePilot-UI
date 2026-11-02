import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Banners — Paper · "Banners de Resiliência da IA (429 / 503 / 504)".
 * `ai` → limite do Throttler (429) · `destructive` → IA indisponível/timeout.
 */
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-[18px] border-[1.8px] px-5 py-4 text-left text-base has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-32 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-4 *:[svg]:row-span-2 *:[svg]:self-center *:[svg:not([class*='size-'])]:size-[42px]",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-ink",
        ai: "border-purple-stroke bg-accent-ai-soft text-purple-stroke",
        destructive: "border-danger bg-danger-soft text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-[15px] leading-[20px] font-bold group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-ink-secondary group-has-[>svg]/alert:col-start-2 md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-ink [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-1/2 right-5 -translate-y-1/2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
