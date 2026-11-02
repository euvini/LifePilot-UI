import type { MovingPlanResponse, TaskResponse } from "@/lib/api/types"
import type { MovingPlan, TaskIconKey, TaskItem } from "@/lib/mock-data"

export function computeDaysRemaining(movingDateStr: string): number {
  const [y, m, d] = movingDateStr.split("-").map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function pickTaskIcon(title: string, index: number): TaskIconKey {
  const lower = title.toLowerCase()
  if (lower.includes("cartório") || lower.includes("document") || lower.includes("visto")) {
    return "doc-check"
  }
  if (lower.includes("nif") || lower.includes("banc") || lower.includes("iban")) {
    return "circle-check"
  }
  if (lower.includes("frete") || lower.includes("container") || lower.includes("caminh")) {
    return "truck"
  }
  if (lower.includes("caixa") || lower.includes("inventar") || lower.includes("embal")) {
    return "box"
  }
  if (lower.includes("chave") || lower.includes("energia") || lower.includes("água") || lower.includes("gás")) {
    return "key"
  }
  const icons: TaskIconKey[] = ["inspect", "doc-check", "circle-check", "truck", "box", "key"]
  return icons[index % icons.length]
}

export function mapBackendTaskToItem(task: TaskResponse, index: number = 0): TaskItem {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "Sem descrição adicional",
    dueDate: task.dueDate ?? "",
    status: task.status,
    icon: pickTaskIcon(task.title, index),
  }
}

export function mapBackendPlanToUi(
  plan: MovingPlanResponse,
  tasks: TaskItem[] = [],
  index: number = 0
): MovingPlan {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === "DONE").length
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length
  const todo = tasks.filter((t) => t.status === "TODO").length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const originShort = plan.origin.split(",")[0]?.trim() || plan.origin
  const destShort = plan.destination.split(",")[0]?.trim() || plan.destination
  const shortRoute = `${originShort} → ${destShort}`

  const sidebarIcons: MovingPlan["sidebarIcon"][] = ["home", "doc", "box"]

  return {
    id: plan.id,
    slug: plan.id.slice(0, 8),
    sidebarTitle: plan.title.replace(/—.*$/, "").trim() || plan.title,
    title: plan.title,
    origin: plan.origin,
    destination: plan.destination,
    shortRoute,
    movingDate: plan.movingDate,
    daysRemaining: computeDaysRemaining(plan.movingDate),
    progress,
    totalTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    todoTasks: todo,
    sidebarIcon: sidebarIcons[index % sidebarIcons.length],
    tasks,
    copilotSuggestions: [],
  }
}
