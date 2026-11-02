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

/* ── Ícones das Telas & Fluxos (Sidebar, Checklist, Hero, Status) ──── */

export const BrandLogoIcon = createDuotoneIcon("BrandLogoIcon", 40, { tone: "green", size: 28 }, (
  <>
    <path d="M8 18L20 8L32 18V32H8V18Z" fill={P} stroke={S} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 32V22C16 19.8 17.8 18 20 18C22.2 18 24 19.8 24 22V32H16Z" fill={F} stroke={S} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="29" cy="11" r="4" fill={F} stroke={S} strokeWidth="1.8" />
  </>
))

export const SidebarPlanHomeIcon = createDuotoneIcon("SidebarPlanHomeIcon", 32, { tone: "green", size: 24 }, (
  <>
    <path d="M6 15L16 7L26 15V26H6V15Z" fill={B} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M13 26V18C13 16.3 14.3 15 16 15C17.7 15 19 16.3 19 18V26H13Z" fill={F} stroke={S} strokeWidth="1.8" />
  </>
))

export const SidebarPlanDocIcon = createDuotoneIcon("SidebarPlanDocIcon", 36, { tone: "pink", size: 32 }, (
  <>
    <rect x="8" y="6" width="20" height="24" rx="3" fill={P} stroke={S} strokeWidth="1.8" />
    <path d="M13 13H23M13 18H20" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="24" cy="24" r="5" fill={F} stroke={S} strokeWidth="1.8" />
  </>
))

export const SidebarPlanBoxIcon = createDuotoneIcon("SidebarPlanBoxIcon", 36, { tone: "neutral", size: 32 }, (
  <>
    <path d="M8 14L18 9L28 14V25L18 30L8 25V14Z" fill={P} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M13 11.5L23 16.5V22.5L18 25V16.5L13 11.5Z" fill="var(--color-surface-subtle)" stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
  </>
))

export const HeroHouseCheckIcon = createDuotoneIcon("HeroHouseCheckIcon", 84, { tone: "green", size: 84 }, (
  <>
    <path d="M16 40L42 18L68 40V68C68 70.2 66.2 72 64 72H20C17.8 72 16 70.2 16 68V40Z" fill={F} stroke={S} strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M10 43L42 16L74 43" stroke={S} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="33" y="46" width="18" height="26" rx="4" fill={P} stroke={S} strokeWidth="2.2" />
    <circle cx="46" cy="59" r="2" fill={S} />
    <circle cx="62" cy="24" r="10" fill={P} stroke={S} strokeWidth="2.2" />
    <path d="M58 24L61 27L66 21" stroke={S} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const TaskDocCheckIcon = createDuotoneIcon("TaskDocCheckIcon", 38, { tone: "green", size: 38 }, (
  <>
    <rect x="6" y="5" width="26" height="28" rx="5" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M13 19L17 23L25 14" stroke={S} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const TaskCircleCheckIcon = createDuotoneIcon("TaskCircleCheckIcon", 38, { tone: "green", size: 38 }, (
  <>
    <circle cx="19" cy="19" r="14" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M13 19L17 23L25 14" stroke={S} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const TaskTruckIcon = createDuotoneIcon("TaskTruckIcon", 38, { tone: "pink", size: 38 }, (
  <>
    <rect x="4" y="11" width="20" height="15" rx="3" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M24 15H29L33 20V26H24V15Z" fill={P} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="11" cy="27" r="3.5" fill={P} stroke={S} strokeWidth="1.8" />
    <circle cx="28" cy="27" r="3.5" fill={P} stroke={S} strokeWidth="1.8" />
  </>
))

export const TaskBoxIcon = createDuotoneIcon("TaskBoxIcon", 38, { tone: "pink", size: 38 }, (
  <>
    <path d="M7 14L19 8L31 14V26L19 32L7 26V14Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M7 14L19 20L31 14M19 20V32" stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
  </>
))

export const TaskKeyIcon = createDuotoneIcon("TaskKeyIcon", 38, { tone: "neutral", size: 38 }, (
  <>
    <circle cx="15" cy="19" r="7" fill={P} stroke={S} strokeWidth="1.8" />
    <circle cx="15" cy="19" r="2.5" fill={S} />
    <path d="M22 19H32M29 19V24M32 19V23" stroke={S} strokeWidth="1.8" strokeLinecap="round" />
  </>
))

export const TaskInspectIcon = createDuotoneIcon("TaskInspectIcon", 38, { tone: "neutral", size: 38 }, (
  <>
    <rect x="6" y="7" width="26" height="24" rx="5" fill={P} stroke={S} strokeWidth="1.8" />
    <path d="M12 23L26 15M26 15H19M26 15V22" stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const CopilotSparkleBadgeIcon = createDuotoneIcon("CopilotSparkleBadgeIcon", 32, { tone: "purple", size: 32 }, (
  <>
    <path d="M16 3L19.5 12.5L29 16L19.5 19.5L16 29L12.5 19.5L3 16L12.5 12.5L16 3Z" fill={F} stroke={S} strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="24" cy="7" r="2.5" fill={P} stroke={S} strokeWidth="1.6" />
  </>
))

export const SuggestionCheckCircleIcon = createDuotoneIcon("SuggestionCheckCircleIcon", 24, { tone: "purple", size: 24 }, (
  <>
    <circle cx="12" cy="12" r="9.5" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M8 12L10.8 14.8L16 9.5" stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const StatusDoneCircleIcon = createDuotoneIcon("StatusDoneCircleIcon", 24, { tone: "green", size: 24 }, (
  <>
    <circle cx="12" cy="12" r="9.5" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M8 12L10.8 14.8L16 9.5" stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const StatusActiveClockIcon = createDuotoneIcon("StatusActiveClockIcon", 24, { tone: "pink", size: 24 }, (
  <>
    <circle cx="12" cy="12" r="9.5" fill={F} stroke={S} strokeWidth="1.8" />
    <path d="M12 7.5V12L15 14" stroke={S} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </>
))

export const StatusTodoDotIcon = createDuotoneIcon("StatusTodoDotIcon", 24, { tone: "neutral", size: 24 }, (
  <>
    <circle cx="12" cy="12" r="9.5" fill={P} stroke={S} strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3" fill={S} />
  </>
))
