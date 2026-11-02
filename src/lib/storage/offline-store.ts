import { api } from "@/lib/api/client"
import type {
  AcceptTaskSuggestionsDto,
  CreateMovingPlanDto,
  CreateTaskDto,
  UpdateTaskDto,
} from "@/lib/api/types"
import type { CopilotSuggestion, MovingPlan, TaskItem } from "@/types/plan"

const STORAGE_KEYS = {
  PLANS: "lifepilot:cache:plans:v2",
  TASKS: "lifepilot:cache:tasks:v2",
  SUGGESTIONS: "lifepilot:cache:suggestions:v2",
  TIMESTAMPS: "lifepilot:cache:timestamps:v2",
  OUTBOX: "lifepilot:outbox:v2",
} as const

export type OutboxMutation =
  | {
      id: string
      type: "createPlan"
      payload: CreateMovingPlanDto
      tempPlanId: string
      timestamp: number
    }
  | {
      id: string
      type: "deletePlan"
      planId: string
      timestamp: number
    }
  | {
      id: string
      type: "createTask"
      planId: string
      payload: CreateTaskDto
      tempTaskId: string
      timestamp: number
    }
  | {
      id: string
      type: "updateTask"
      planId: string
      taskId: string
      payload: UpdateTaskDto
      timestamp: number
    }
  | {
      id: string
      type: "deleteTask"
      planId: string
      taskId: string
      timestamp: number
    }
  | {
      id: string
      type: "acceptSuggestions"
      planId: string
      payload: AcceptTaskSuggestionsDto
      timestamp: number
    }

export const STALE_TIME_MS = 120000 // 2 minutos

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export const offlineStore = {
  getPlans(): MovingPlan[] | null {
    if (!isBrowser()) return null
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANS)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  setPlans(plans: MovingPlan[]): void {
    if (!isBrowser()) return
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans))
      this.setTimestamp("plans")
    } catch {
      // Storage cheio ou desabilitado
    }
  },

  removePlan(planId: string): void {
    if (!isBrowser()) return
    try {
      const current = this.getPlans() ?? []
      const filtered = current.filter((p) => p.id !== planId)
      this.setPlans(filtered)

      // Limpa tarefas cacheadas do plano
      const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (rawTasks) {
        const map = JSON.parse(rawTasks) as Record<string, TaskItem[]>
        delete map[planId]
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(map))
      }

      // Limpa sugestões cacheadas do plano
      const rawSuggs = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS)
      if (rawSuggs) {
        const map = JSON.parse(rawSuggs) as Record<string, unknown>
        delete map[planId]
        localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(map))
      }
    } catch {
      // Storage
    }
  },

  getTasks(planId: string): TaskItem[] | null {
    if (!isBrowser()) return null
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (!raw) return null
      const map = JSON.parse(raw) as Record<string, TaskItem[]>
      return map[planId] || null
    } catch {
      return null
    }
  },

  setTasks(planId: string, tasks: TaskItem[]): void {
    if (!isBrowser()) return
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS)
      const map = raw ? (JSON.parse(raw) as Record<string, TaskItem[]>) : {}
      map[planId] = tasks
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(map))
      this.setTimestamp(`tasks:${planId}`)
    } catch {
      // Storage cheio ou desabilitado
    }
  },

  getSuggestions(planId: string): CopilotSuggestion[] | null {
    if (!isBrowser()) return null
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS)
      if (!raw) return null
      const map = JSON.parse(raw) as Record<string, CopilotSuggestion[]>
      return map[planId] || null
    } catch {
      return null
    }
  },

  setSuggestions(planId: string, suggestions: CopilotSuggestion[]): void {
    if (!isBrowser()) return
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS)
      const map = raw ? (JSON.parse(raw) as Record<string, CopilotSuggestion[]>) : {}
      map[planId] = suggestions
      localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(map))
    } catch {
      // Storage cheio ou desabilitado
    }
  },

  isStale(key: string): boolean {
    if (!isBrowser()) return true
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMESTAMPS)
      if (!raw) return true
      const timestamps = JSON.parse(raw) as Record<string, number>
      const last = timestamps[key]
      if (!last) return true
      return Date.now() - last > STALE_TIME_MS
    } catch {
      return true
    }
  },

  setTimestamp(key: string): void {
    if (!isBrowser()) return
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMESTAMPS)
      const timestamps = raw ? (JSON.parse(raw) as Record<string, number>) : {}
      timestamps[key] = Date.now()
      localStorage.setItem(STORAGE_KEYS.TIMESTAMPS, JSON.stringify(timestamps))
    } catch {
      // Storage cheio ou desabilitado
    }
  },

  getOutbox(): OutboxMutation[] {
    if (!isBrowser()) return []
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.OUTBOX)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  enqueueOutbox(mutation: OutboxMutation): void {
    if (!isBrowser()) return
    try {
      const queue = this.getOutbox()
      queue.push(mutation)
      localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(queue))
    } catch {
      // Storage cheio
    }
  },

  removeOutbox(mutationId: string): void {
    if (!isBrowser()) return
    try {
      const queue = this.getOutbox().filter((m) => m.id !== mutationId)
      localStorage.setItem(STORAGE_KEYS.OUTBOX, JSON.stringify(queue))
    } catch {
      // Storage cheio
    }
  },

  clearOutbox(): void {
    if (!isBrowser()) return
    try {
      localStorage.removeItem(STORAGE_KEYS.OUTBOX)
    } catch {
      // Storage
    }
  },

  async flushOutbox(): Promise<{ processed: number; failed: number }> {
    const queue = this.getOutbox()
    if (queue.length === 0) return { processed: 0, failed: 0 }

    let processed = 0
    let failed = 0

    // Mapeamento de id temporário de plano -> id real gerado no backend
    const planIdMap: Record<string, string> = {}

    for (const mutation of queue) {
      try {
        if (mutation.type === "createPlan") {
          const res = await api.movingPlans.create(mutation.payload)
          planIdMap[mutation.tempPlanId] = res.id
        } else if (mutation.type === "deletePlan") {
          const targetPlanId = planIdMap[mutation.planId] || mutation.planId
          await api.movingPlans.delete(targetPlanId)
        } else if (mutation.type === "createTask") {
          const targetPlanId = planIdMap[mutation.planId] || mutation.planId
          await api.tasks.create(targetPlanId, mutation.payload)
        } else if (mutation.type === "updateTask") {
          const targetPlanId = planIdMap[mutation.planId] || mutation.planId
          await api.tasks.update(targetPlanId, mutation.taskId, mutation.payload)
        } else if (mutation.type === "deleteTask") {
          const targetPlanId = planIdMap[mutation.planId] || mutation.planId
          await api.tasks.delete(targetPlanId, mutation.taskId)
        } else if (mutation.type === "acceptSuggestions") {
          const targetPlanId = planIdMap[mutation.planId] || mutation.planId
          await api.suggestions.accept(targetPlanId, mutation.payload)
        }

        this.removeOutbox(mutation.id)
        processed++
      } catch (err) {
        console.warn("Falha ao sincronizar item da outbox:", mutation, err)
        failed++
        break // Interrompe para preservar ordem
      }
    }

    return { processed, failed }
  },
}
