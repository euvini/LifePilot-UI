"use client"

import * as React from "react"
import { cn } from "cn"
import { Calendar as CalendarIcon } from "lucide-react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function parseIsoDateOnly(value?: string | null): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return date
}

export function formatIsoDateOnly(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export interface DatePickerProps {
  id?: string
  value?: string
  defaultValue?: string
  onChange?: (nextIsoDate: string) => void
  minDate?: string
  maxDate?: string
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
  variant?: "field" | "pill" | "compact"
  trailingBadge?: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
  ariaLabel?: string
}

export function DatePicker({
  id,
  value: controlledValue,
  defaultValue = "",
  onChange,
  minDate,
  maxDate,
  placeholder = "YYYY-MM-DD",
  invalid = false,
  disabled = false,
  variant = "field",
  trailingBadge,
  align = "start",
  className,
  ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue)

  const value = controlledValue ?? uncontrolledValue

  function updateValue(next: string) {
    if (controlledValue === undefined) {
      setUncontrolledValue(next)
    }
    onChange?.(next)
  }

  const selectedDate = React.useMemo(() => parseIsoDateOnly(value), [value])
  const minDateObj = React.useMemo(() => parseIsoDateOnly(minDate), [minDate])
  const maxDateObj = React.useMemo(() => parseIsoDateOnly(maxDate), [maxDate])

  const [month, setMonth] = React.useState<Date>(
    () => selectedDate ?? maxDateObj ?? new Date()
  )

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && selectedDate) {
      setMonth(selectedDate)
    }
    setOpen(nextOpen)
  }

  const disabledMatcher = React.useMemo(() => {
    const matchers: Array<{ before: Date } | { after: Date }> = []
    if (minDateObj) matchers.push({ before: minDateObj })
    if (maxDateObj) matchers.push({ after: maxDateObj })
    return matchers.length > 0 ? matchers : undefined
  }, [minDateObj, maxDateObj])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          data-invalid={invalid || undefined}
          aria-label={ariaLabel}
          className={cn(
            "group/datepicker inline-flex items-center justify-between gap-2 text-left transition-colors outline-none disabled:pointer-events-none disabled:opacity-40",
            variant === "field" &&
              "w-full rounded-md border border-border bg-surface px-4 py-3 hover:border-border-strong data-[invalid=true]:border-danger data-[invalid=true]:bg-danger-soft data-[state=open]:border-primary data-[state=open]:bg-canvas",
            variant === "pill" &&
              "rounded-full border-[1.5px] border-border bg-surface px-3 py-1.5 hover:border-border-strong data-[invalid=true]:border-danger data-[invalid=true]:bg-danger-soft data-[state=open]:border-primary",
            variant === "compact" &&
              "w-[142px] shrink-0 justify-center rounded-[8px] border border-border bg-surface px-2.5 py-1.5 hover:border-border-strong data-[invalid=true]:border-danger data-[invalid=true]:bg-danger-soft data-[state=open]:border-primary",
            className
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon
              className={cn(
                "shrink-0 transition-colors",
                variant === "field" ? "size-[18px]" : "size-3.5",
                invalid
                  ? "text-danger"
                  : "text-primary group-disabled/datepicker:text-ink-muted"
              )}
            />
            <span
              className={cn(
                "font-mono font-semibold",
                variant === "pill" ? "text-xs/xs" : "text-sm leading-4",
                variant === "field" && "text-base/sm",
                invalid
                  ? "text-danger"
                  : value
                    ? "text-ink"
                    : "text-ink-muted"
              )}
            >
              {value || placeholder}
            </span>
          </span>

          {trailingBadge}
        </button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-auto p-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="font-mono text-xs/xs font-bold tracking-wide text-ink-secondary uppercase">
            SELECIONAR DATA
          </span>
          {maxDate && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[10px] leading-3 font-bold text-primary">
              TETO ≤ {maxDate}
            </span>
          )}
        </div>

        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          selected={selectedDate}
          disabled={disabledMatcher}
          onSelect={(date) => {
            if (!date) return
            updateValue(formatIsoDateOnly(date))
            setOpen(false)
          }}
        />

        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="font-mono text-xs/xs text-ink-muted">
            ISO: {value || "—"}
          </span>
          <button
            type="button"
            onClick={() => {
              const today = new Date()
              if (maxDateObj && today > maxDateObj) {
                updateValue(formatIsoDateOnly(maxDateObj))
              } else {
                updateValue(formatIsoDateOnly(today))
              }
              setOpen(false)
            }}
            className="rounded-full border border-border-strong bg-surface-subtle px-2.5 py-1 font-mono text-xs/xs font-bold text-ink transition-colors hover:bg-primary hover:text-icon-mint"
          >
            Hoje
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
