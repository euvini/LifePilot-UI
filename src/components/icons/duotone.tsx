import * as React from "react"
import { cn } from "cn"

/**
 * Iconografia ilustrativa duotone — fórmula Wellhub.
 * Paper · "03 · Iconografia Ilustrativa Duotone": contorno fino contínuo +
 * fill principal 100% sólido + fill secundário BG.
 *
 * Cada ícone usa três variáveis CSS, definidas pelo `tone`:
 *  --duo-stroke (contorno) · --duo-fill (principal) · --duo-bg (secundário)
 */
export type DuotoneTone = "neutral" | "pink" | "purple" | "green"

const toneClass: Record<DuotoneTone, string> = {
  neutral:
    "[--duo-stroke:var(--color-ink)] [--duo-fill:var(--color-surface)] [--duo-bg:var(--color-surface)]",
  pink: "[--duo-stroke:var(--color-pink-stroke)] [--duo-fill:var(--color-pink-main)] [--duo-bg:var(--color-danger-soft)]",
  purple:
    "[--duo-stroke:var(--color-purple-stroke)] [--duo-fill:var(--color-accent-ai)] [--duo-bg:var(--color-accent-ai-soft)]",
  green:
    "[--duo-stroke:var(--color-primary)] [--duo-fill:var(--color-icon-mint)] [--duo-bg:var(--color-primary-soft)]",
}

export type DuotoneIconProps = Omit<React.ComponentProps<"svg">, "children"> & {
  tone?: DuotoneTone
  /** Tamanho em px (largura = altura). */
  size?: number
}

const S = "var(--duo-stroke)"
const F = "var(--duo-fill)"
const B = "var(--duo-bg)"
const P = "var(--color-surface)"

function createDuotoneIcon(
  displayName: string,
  viewBox: number,
  defaults: { tone: DuotoneTone; size: number },
  children: React.ReactNode
) {
  function Icon({
    tone = defaults.tone,
    size = defaults.size,
    className,
    ...props
  }: DuotoneIconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={props["aria-label"] ? undefined : true}
        data-slot="duotone-icon"
        className={cn("shrink-0", toneClass[tone], className)}
        {...props}
      >
        {children}
      </svg>
    )
  }
  Icon.displayName = displayName
  return Icon
}

/* ── Categorias (40×40) ────────────────────────────────────────────── */

export const PackageIcon = createDuotoneIcon("PackageIcon", 40, { tone: "pink", size: 36 }, (
  <>
    <path d="M8 15L20 9L32 15V28L20 34L8 28V15Z" fill={P} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M8 15L20 21L32 15" stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14 12L26 18V25L20 28V18L14 12Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
  </>
))

export const CopilotIcon = createDuotoneIcon("CopilotIcon", 40, { tone: "purple", size: 36 }, (
  <>
    <path d="M18 11C18 8 22 7 24 5C25 8 29 7 28 11C27 14 22 14 21 17" fill={F} stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 19H27V27C27 30.3 24.3 33 21 33H17C13.7 33 11 30.3 11 27V19Z" fill={P} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M27 21H30C31.7 21 33 22.3 33 24C33 25.7 31.7 27 30 27H27" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
    <rect x="9" y="33" width="20" height="3.5" rx="1.75" fill={F} stroke={S} strokeWidth="1.8" />
  </>
))

export const TruckIcon = createDuotoneIcon("TruckIcon", 40, { tone: "green", size: 36 }, (
  <>
    <rect x="5" y="13" width="19" height="14" rx="2.5" fill={P} stroke={S} strokeWidth="1.8" />
    <path d="M24 17H30.5L34.5 22V27H24V17Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="28" r="4" fill={F} stroke={S} strokeWidth="1.8" />
    <circle cx="29" cy="28" r="4" fill={F} stroke={S} strokeWidth="1.8" />
  </>
))

export const UtilitiesIcon = createDuotoneIcon("UtilitiesIcon", 40, { tone: "pink", size: 36 }, (
  <>
    <path d="M20 7C20 7 30 14.5 30 23C30 28.5 25.5 33 20 33C14.5 33 10 28.5 10 23C10 17 15 12 16 14C17 16 20 11 20 7Z" fill={P} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M20 19C20 19 25 22.5 25 26.5C25 29.5 22.8 32 20 32C17.2 32 15 29.5 15 26.5C15 23.5 18 21 20 19Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
  </>
))

export const HomeIcon = createDuotoneIcon("HomeIcon", 40, { tone: "green", size: 36 }, (
  <>
    <path d="M8 18L20 8L32 18V32H8V18Z" fill={P} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M16 32V22C16 19.8 17.8 18 20 18C22.2 18 24 19.8 24 22V32H16Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="20" cy="14" r="2.2" fill={F} stroke={S} strokeWidth="1.6" />
  </>
))

/* ── Ações (32×32) — usados nos botões ─────────────────────────────── */

export const PlusSquareIcon = createDuotoneIcon("PlusSquareIcon", 32, { tone: "green", size: 28 }, (
  <>
    <rect x="4" y="4" width="24" height="24" rx="7" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M16 10v12M10 16h12" stroke={S} strokeWidth="2.2" strokeLinecap="round" />
  </>
))

export const SparkleIcon = createDuotoneIcon("SparkleIcon", 32, { tone: "purple", size: 28 }, (
  <path d="M16 5L18.5 13.5L27 16L18.5 18.5L16 27L13.5 18.5L5 16L13.5 13.5L16 5Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
))

export const PlusCircleIcon = createDuotoneIcon("PlusCircleIcon", 32, { tone: "neutral", size: 28 }, (
  <>
    <circle cx="16" cy="16" r="11" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M16 11v10M11 16h10" stroke={S} strokeWidth="2" strokeLinecap="round" />
  </>
))

export const TrashIcon = createDuotoneIcon("TrashIcon", 32, { tone: "pink", size: 26 }, (
  <>
    <rect x="8" y="10" width="16" height="17" rx="2.5" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M6 10H26M12 10V7H20V10" stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

/* ── Estados da API (48×48) — banners de resiliência ───────────────── */

export const ShieldClockIcon = createDuotoneIcon("ShieldClockIcon", 48, { tone: "purple", size: 42 }, (
  <>
    <path d="M24 6L38 12V23C38 32.5 32 40 24 43C16 40 10 32.5 10 23V12L24 6Z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="24" cy="24" r="7" fill={P} stroke={S} strokeWidth="1.8" />
    <path d="M24 21V24.5L26.5 26" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
  </>
))

export const AlertCircleIcon = createDuotoneIcon("AlertCircleIcon", 48, { tone: "pink", size: 42 }, (
  <>
    <circle cx="24" cy="24" r="16" fill={F} stroke={S} strokeWidth="2" />
    <rect x="21.5" y="13" width="5" height="13" rx="2.5" fill={P} stroke={S} strokeWidth="1.8" />
    <circle cx="24" cy="32" r="2.8" fill={P} stroke={S} strokeWidth="1.8" />
  </>
))

/* ── Ilustrativos (64×64) — hero cards ─────────────────────────────── */

export const HomeAddIcon = createDuotoneIcon("HomeAddIcon", 64, { tone: "green", size: 96 }, (
  <>
    <path d="M12 30L32 13L52 30V50H12V30Z" fill={B} stroke={S} strokeWidth="2" strokeLinejoin="round" />
    <path d="M25 50V35C25 31.1 28.1 28 32 28C35.9 28 39 31.1 39 35V50H25Z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="46" cy="18" r="7" fill={F} stroke={S} strokeWidth="2" />
    <path d="M43 18H49M46 15V21" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
  </>
))

export const CopilotCupIcon = createDuotoneIcon("CopilotCupIcon", 64, { tone: "purple", size: 112 }, (
  <>
    <path d="M28 19C28 14 34 13 37 9C39 14 46 12 44 19C42 24 34 24 32 28" fill={F} stroke={S} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 30H42V43C42 48.5 37.5 53 32 53H26C20.5 53 16 48.5 16 43V30Z" fill={P} stroke={S} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M42 33H47C49.8 33 52 35.2 52 38C52 40.8 49.8 43 47 43H42" stroke={S} strokeWidth="2.2" strokeLinecap="round" />
    <rect x="12" y="53" width="34" height="5" rx="2.5" fill={F} stroke={S} strokeWidth="2.2" />
  </>
))

export const CloudIcon = createDuotoneIcon("CloudIcon", 64, { tone: "neutral", size: 96 }, (
  <>
    <path d="M18 28C18 19.2 25.2 12 34 12C42.8 12 50 19.2 50 28V38C50 42.4 46.4 46 42 46H22C16.5 46 12 41.5 12 36C12 31.2 15.4 27.2 20 26.2Z" fill={F} stroke={S} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 26.2C24.5 25.2 29 28 31 32C33.5 36.8 39.5 36.5 43 32" stroke={S} strokeWidth="2" strokeLinecap="round" />
    <rect x="24" y="46" width="18" height="10" rx="2" fill={B} stroke={S} strokeWidth="2" strokeLinejoin="round" />
    <path d="M36 46V56" stroke={S} strokeWidth="2" />
  </>
))
