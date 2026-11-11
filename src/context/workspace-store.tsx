"use client"

import * as React from "react"
import { toast } from "sonner"

import { api, ApiError } from "@/lib/api/client"
import type { CreateMovingPlanDto } from "@/lib/api/types"
import { useAuth } from "@/context/auth-context"
import {
  mapBackendPlanToUi,
  mapBackendTaskToItem,
} from "@/lib/storage/mappers"
import {
  offlineStore,
  type OutboxMutation,
} from "@/lib/storage/offline-store"
import type {
  CopilotSuggestion,
  MovingPlan,
  TaskItem,
  TaskStatus,
} from "@/types/plan"

export type QuickViewFilter = "all" | "in_progress" | "ai"

export interface AiConfig {
  provider: string
  model: string
  baseUrl: string
  isCloud: boolean
  label: string
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
}

interface WorkspaceStoreValue {
  plans: MovingPlan[]
  activePlanId: string
  activePlan: MovingPlan | null
  quickFilter: QuickViewFilter
  checklistTab: "all" | "pending"
  isGeneratingAi: boolean
  isOnline: boolean
  isSyncing: boolean
  isLoadingPlans: boolean
  lastAiError: ApiError | null
  aiConfig: AiConfig
  clearAiError: () => void
  selectPlan: (planId: string) => void
  setQuickFilter: (filter: QuickViewFilter) => void
  setChecklistTab: (tab: "all" | "pending") => void
  cycleTaskStatus: (taskId: string) => Promise<void>
  addQuickTask: (title: string, dueDate: string) => Promise<boolean>
  deleteTask: (taskId: string) => Promise<void>
  toggleSuggestion: (suggestionId: string) => void
  acceptSuggestionsBatch: () => Promise<void>
  discardSuggestions: () => void
  generateAiSuggestions: (maxSuggestions?: number) => Promise<void>
  createNewPlan: (dto: CreateMovingPlanDto) => Promise<MovingPlan>
  deletePlan: (planId: string) => Promise<boolean>
  refreshActivePlanTasks: () => Promise<void>
  refreshPlans: () => Promise<void>
}

const WorkspaceStoreContext = React.createContext<WorkspaceStoreValue | null>(
  null
)

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useAuth()
  const [plans, setPlans] = React.useState<MovingPlan[]>([])
  const [activePlanId, setActivePlanId] = React.useState<string>("")

  // Hidratação a partir do cache local no primeiro render do cliente apenas se autenticado
  React.useEffect(() => {
    void Promise.resolve().then(() => {
      if (!isAuthenticated) return
      const cached = offlineStore.getPlans()
      if (cached && cached.length > 0) {
        setPlans(cached)
        setActivePlanId((prev) => prev || cached[0].id)
      }
    })
  }, [isAuthenticated])

  const [quickFilter, setQuickFilterState] =
    React.useState<QuickViewFilter>("all")
  const [checklistTab, setChecklistTab] = React.useState<"all" | "pending">(
    "all"
  )
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState<boolean>(() => {
    return typeof window !== "undefined" ? navigator.onLine : true
  })
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [isLoadingPlans, setIsLoadingPlans] = React.useState(true)
  const [lastAiError, setLastAiError] = React.useState<ApiError | null>(null)
  const [aiConfig, setAiConfig] = React.useState<AiConfig>({
    provider: "Ollama",
    model: "beam:cloud",
    baseUrl: "https://ollama.com",
    isCloud: true,
    label: "Ollama Cloud · beam:cloud",
  })

  const activePlan = React.useMemo(() => {
    if (plans.length === 0) return null
    return plans.find((p) => p.id === activePlanId) ?? plans[0]
  }, [plans, activePlanId])

  // Sincroniza fila de outbox pendente
  const syncOutbox = React.useCallback(async () => {
    const queue = offlineStore.getOutbox()
    if (queue.length === 0) return

    setIsSyncing(true)
    const { processed, failed } = await offlineStore.flushOutbox()
    setIsSyncing(false)

    if (processed > 0) {
      toast.success(
        `${processed} alteraç${processed === 1 ? "ão" : "ões"} offline sincronizada(s) com o servidor.`
      )
    }
    if (failed > 0) {
      toast.error(
        `Falha ao sincronizar ${failed} item(ns) offline. Tentaremos novamente em instantes.`
      )
    }
  }, [])

  // Monitoramento de conectividade (online / offline)
  React.useEffect(() => {
    if (typeof window === "undefined") return

    const handleOnline = () => {
      setIsOnline(true)
      toast.success("Conexão restabelecida. Sincronizando dados...")
      void syncOutbox()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning("Você está offline. As alterações serão salvas localmente.")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Healthcheck ping silencioso
    api.health
      .check()
      .then(() => setIsOnline(true))
      .catch(() => {
        // Se backend não responder, não impede uso offline
      })

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [syncOutbox])

  // Função centralizada para recarregar lista de planos do backend
  const refreshPlans = React.useCallback(async () => {
    if (!navigator.onLine) {
      setIsLoadingPlans(false)
      return
    }

    try {
      setIsLoadingPlans(true)
      const [backendPlans, aiRes] = await Promise.allSettled([
        api.movingPlans.list(),
        api.health.ai(),
      ])

      if (aiRes.status === "fulfilled" && aiRes.value?.model) {
        setAiConfig({
          provider: aiRes.value.provider,
          model: aiRes.value.model,
          baseUrl: aiRes.value.baseUrl,
          isCloud: aiRes.value.isCloud,
          label: aiRes.value.label || `${aiRes.value.provider} · ${aiRes.value.model}`,
        })
      }

      if (backendPlans.status === "fulfilled" && Array.isArray(backendPlans.value)) {
        const mapped = backendPlans.value.map((bp, idx) => {
          const cachedTasks = offlineStore.getTasks(bp.id) ?? []
          const cachedSuggs = offlineStore.getSuggestions(bp.id) ?? []
          const uiPlan = mapBackendPlanToUi(bp, cachedTasks, idx)
          uiPlan.copilotSuggestions = cachedSuggs
          return uiPlan
        })

        setPlans(mapped)
        offlineStore.setPlans(mapped)

        if (mapped.length > 0 && (!activePlanId || !mapped.some((p) => p.id === activePlanId))) {
          setActivePlanId(mapped[0].id)
        }
      }
    } catch (err) {
      console.warn("Falha ao buscar planos do backend:", err)
    } finally {
      setIsLoadingPlans(false)
    }
  }, [activePlanId])

  // Carrega planos na inicialização
  React.useEffect(() => {
    let isMounted = true

    async function loadInitial() {
      if (!isAuthenticated) {
        if (isMounted) {
          setPlans([])
          setActivePlanId("")
          setIsLoadingPlans(false)
        }
        return
      }

      if (!navigator.onLine) {
        if (isMounted) {
          setIsLoadingPlans(false)
        }
        return
      }

      try {
        const [backendPlans, aiRes] = await Promise.allSettled([
          api.movingPlans.list(),
          api.health.ai(),
        ])
        if (!isMounted) return

        if (aiRes.status === "fulfilled" && aiRes.value?.model) {
          setAiConfig({
            provider: aiRes.value.provider,
            model: aiRes.value.model,
            baseUrl: aiRes.value.baseUrl,
            isCloud: aiRes.value.isCloud,
            label: aiRes.value.label || `${aiRes.value.provider} · ${aiRes.value.model}`,
          })
        }

        if (backendPlans.status === "fulfilled" && Array.isArray(backendPlans.value)) {
          const mapped = backendPlans.value.map((bp, idx) => {
            const cachedTasks = offlineStore.getTasks(bp.id) ?? []
            const cachedSuggs = offlineStore.getSuggestions(bp.id) ?? []
            const uiPlan = mapBackendPlanToUi(bp, cachedTasks, idx)
            uiPlan.copilotSuggestions = cachedSuggs
            return uiPlan
          })

          setPlans(mapped)
          offlineStore.setPlans(mapped)

          if (
            mapped.length > 0 &&
            (!activePlanId || !mapped.some((p) => p.id === activePlanId))
          ) {
            setActivePlanId(mapped[0].id)
          }
        }
      } catch (err) {
        console.warn("Falha ao carregar planos iniciais do backend:", err)
      } finally {
        if (isMounted) {
          setIsLoadingPlans(false)
        }
      }
    }

    void loadInitial()

    return () => {
      isMounted = false
    }
  }, [activePlanId, isAuthenticated, user?.id])

  // Sincroniza tarefas do plano ativo de forma assíncrona
  React.useEffect(() => {
    let isMounted = true

    async function syncActiveTasks() {
      if (!activePlanId || !navigator.onLine) return
      if (!offlineStore.isStale(`tasks:${activePlanId}`)) return

      try {
        setIsSyncing(true)
        const backendTasks = await api.tasks.list(activePlanId)
        if (!isMounted) return

        const mappedTasks = backendTasks.map(mapBackendTaskToItem)
        offlineStore.setTasks(activePlanId, mappedTasks)

        setPlans((prev) =>
          prev.map((p) => {
            if (p.id !== activePlanId) return p
            const total = mappedTasks.length
            const completed = mappedTasks.filter((t) => t.status === "DONE").length
            const inProgress = mappedTasks.filter((t) => t.status === "IN_PROGRESS").length
            const todo = mappedTasks.filter((t) => t.status === "TODO").length
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0

            return {
              ...p,
              tasks: mappedTasks,
              totalTasks: total,
              completedTasks: completed,
              inProgressTasks: inProgress,
              todoTasks: todo,
              progress,
            }
          })
        )
      } catch {
        // Mantém cache
      } finally {
        if (isMounted) {
          setIsSyncing(false)
        }
      }
    }

    void syncActiveTasks()

    return () => {
      isMounted = false
    }
  }, [activePlanId])

  // Recarga manual forçada sob demanda de tarefas do plano ativo
  const refreshActivePlanTasks = React.useCallback(async () => {
    if (!activePlanId || !navigator.onLine) return

    try {
      setIsSyncing(true)
      const backendTasks = await api.tasks.list(activePlanId)
      const mappedTasks = backendTasks.map(mapBackendTaskToItem)
      offlineStore.setTasks(activePlanId, mappedTasks)

      setPlans((prev) =>
        prev.map((p) => {
          if (p.id !== activePlanId) return p
          const total = mappedTasks.length
          const completed = mappedTasks.filter((t) => t.status === "DONE").length
          const inProgress = mappedTasks.filter((t) => t.status === "IN_PROGRESS").length
          const todo = mappedTasks.filter((t) => t.status === "TODO").length
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0

          return {
            ...p,
            tasks: mappedTasks,
            totalTasks: total,
            completedTasks: completed,
            inProgressTasks: inProgress,
            todoTasks: todo,
            progress,
          }
        })
      )
    } catch {
      // Ignora falha de rede
    } finally {
      setIsSyncing(false)
    }
  }, [activePlanId])

  const selectPlan = React.useCallback((planId: string) => {
    setActivePlanId(planId)
    setQuickFilterState("all")
    setChecklistTab("all")
  }, [])

  const setQuickFilter = React.useCallback((filter: QuickViewFilter) => {
    setQuickFilterState(filter)
    if (filter === "in_progress") {
      setChecklistTab("pending")
    } else {
      setChecklistTab("all")
    }
  }, [])

  // Atualização otimista de status da tarefa + persistência + chamada backend / outbox
  const cycleTaskStatus = React.useCallback(
    async (taskId: string) => {
      if (!activePlan) return
      const currentTask = activePlan.tasks.find((t) => t.id === taskId)
      if (!currentTask) return

      const nextStatus = NEXT_STATUS[currentTask.status]

      // 1. Atualização Otimista no Estado
      const updatedTasks = activePlan.tasks.map((task) => {
        if (task.id !== taskId) return task
        return {
          ...task,
          status: nextStatus,
          icon: nextStatus === "DONE" ? ("circle-check" as const) : task.icon,
        }
      })

      const total = updatedTasks.length
      const completed = updatedTasks.filter((t) => t.status === "DONE").length
      const inProgress = updatedTasks.filter((t) => t.status === "IN_PROGRESS").length
      const todo = updatedTasks.filter((t) => t.status === "TODO").length
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0

      const updatedPlan: MovingPlan = {
        ...activePlan,
        tasks: updatedTasks,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        progress,
      }

      setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)))
      offlineStore.setTasks(activePlan.id, updatedTasks)

      // 2. Persistência no Backend ou Fila Outbox
      try {
        if (navigator.onLine) {
          await api.tasks.update(activePlan.id, taskId, { status: nextStatus })
        } else {
          const mutation: OutboxMutation = {
            id: `outbox-${Date.now()}`,
            type: "updateTask",
            planId: activePlan.id,
            taskId,
            payload: { status: nextStatus },
            timestamp: Date.now(),
          }
          offlineStore.enqueueOutbox(mutation)
        }
      } catch (err) {
        console.warn("Erro ao salvar status no backend, enfileirando outbox:", err)
        const mutation: OutboxMutation = {
          id: `outbox-${Date.now()}`,
          type: "updateTask",
          planId: activePlan.id,
          taskId,
          payload: { status: nextStatus },
          timestamp: Date.now(),
        }
        offlineStore.enqueueOutbox(mutation)
      }
    },
    [activePlan]
  )

  // Criação de tarefa rápida
  const addQuickTask = React.useCallback(
    async (title: string, dueDate: string): Promise<boolean> => {
      if (!activePlan) return false
      const trimmed = title.trim()
      if (!trimmed) return false

      if (dueDate && dueDate > activePlan.movingDate) {
        toast.error(
          `Prazo inválido (${dueDate}): não pode ser posterior à data da mudança (${activePlan.movingDate}).`
        )
        return false
      }

      const tempId = `temp-${Date.now()}`
      const newTask: TaskItem = {
        id: tempId,
        title: trimmed,
        description: "Tarefa adicionada manualmente ao checklist do plano",
        dueDate,
        status: "TODO",
        icon: "inspect",
      }

      // Otimista
      const updatedTasks = [newTask, ...activePlan.tasks]
      const total = updatedTasks.length
      const todo = updatedTasks.filter((t) => t.status === "TODO").length
      const completed = updatedTasks.filter((t) => t.status === "DONE").length
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0

      const updatedPlan: MovingPlan = {
        ...activePlan,
        tasks: updatedTasks,
        totalTasks: total,
        todoTasks: todo,
        progress,
      }

      setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)))
      offlineStore.setTasks(activePlan.id, updatedTasks)
      toast.success("Tarefa adicionada ao plano.")

      // Backend / Outbox
      try {
        if (navigator.onLine) {
          const res = await api.tasks.create(activePlan.id, {
            title: trimmed,
            dueDate: dueDate || undefined,
            status: "TODO",
          })
          const finalizedTasks = updatedTasks.map((t) =>
            t.id === tempId ? { ...t, id: res.id } : t
          )
          setPlans((prev) =>
            prev.map((p) =>
              p.id === activePlan.id ? { ...p, tasks: finalizedTasks } : p
            )
          )
          offlineStore.setTasks(activePlan.id, finalizedTasks)
        } else {
          offlineStore.enqueueOutbox({
            id: `outbox-${Date.now()}`,
            type: "createTask",
            planId: activePlan.id,
            tempTaskId: tempId,
            payload: { title: trimmed, dueDate: dueDate || undefined, status: "TODO" },
            timestamp: Date.now(),
          })
        }
      } catch (err) {
        console.warn("Falha ao criar no backend, enfileirando outbox:", err)
        offlineStore.enqueueOutbox({
          id: `outbox-${Date.now()}`,
          type: "createTask",
          planId: activePlan.id,
          tempTaskId: tempId,
          payload: { title: trimmed, dueDate: dueDate || undefined, status: "TODO" },
          timestamp: Date.now(),
        })
      }

      return true
    },
    [activePlan]
  )

  const deleteTask = React.useCallback(
    async (taskId: string) => {
      if (!activePlan) return
      const updatedTasks = activePlan.tasks.filter((t) => t.id !== taskId)
      const total = updatedTasks.length
      const completed = updatedTasks.filter((t) => t.status === "DONE").length
      const inProgress = updatedTasks.filter((t) => t.status === "IN_PROGRESS").length
      const todo = updatedTasks.filter((t) => t.status === "TODO").length
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0

      const updatedPlan: MovingPlan = {
        ...activePlan,
        tasks: updatedTasks,
        totalTasks: total,
        completedTasks: completed,
        inProgressTasks: inProgress,
        todoTasks: todo,
        progress,
      }

      setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)))
      offlineStore.setTasks(activePlan.id, updatedTasks)
      toast.success("Tarefa eliminada (204).")

      try {
        if (navigator.onLine) {
          await api.tasks.delete(activePlan.id, taskId)
        } else {
          offlineStore.enqueueOutbox({
            id: `outbox-${Date.now()}`,
            type: "deleteTask",
            planId: activePlan.id,
            taskId,
            timestamp: Date.now(),
          })
        }
      } catch {
        offlineStore.enqueueOutbox({
          id: `outbox-${Date.now()}`,
          type: "deleteTask",
          planId: activePlan.id,
          taskId,
          timestamp: Date.now(),
        })
      }
    },
    [activePlan]
  )

  const toggleSuggestion = React.useCallback(
    (suggestionId: string) => {
      if (!activePlan) return
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.id !== activePlan.id) return plan
          const updatedSuggs = plan.copilotSuggestions.map((s) =>
            s.id === suggestionId ? { ...s, selected: !s.selected } : s
          )
          offlineStore.setSuggestions(plan.id, updatedSuggs)
          return {
            ...plan,
            copilotSuggestions: updatedSuggs,
          }
        })
      )
    },
    [activePlan]
  )

  const acceptSuggestionsBatch = React.useCallback(async () => {
    if (!activePlan) return
    const selectedSuggestions = activePlan.copilotSuggestions.filter(
      (s) => s.selected
    )
    if (selectedSuggestions.length === 0) {
      toast.info("Selecione ao menos uma sugestão para aceitar o lote.")
      return
    }

    const newTasks: TaskItem[] = selectedSuggestions.map((s, idx) => ({
      id: `accepted-${s.id}-${Date.now()}-${idx}`,
      title: s.title,
      description: s.description || "Sugestão gerada pelo Copiloto IA · Confirmada em lote",
      dueDate: s.dueDate,
      status: "TODO",
      icon: "key",
    }))

    const remainingSuggestions = activePlan.copilotSuggestions.filter(
      (s) => !s.selected
    )
    const combinedTasks = [...activePlan.tasks, ...newTasks]
    const total = combinedTasks.length
    const todo = combinedTasks.filter((t) => t.status === "TODO").length
    const completed = combinedTasks.filter((t) => t.status === "DONE").length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    const updatedPlan: MovingPlan = {
      ...activePlan,
      tasks: combinedTasks,
      copilotSuggestions: remainingSuggestions,
      totalTasks: total,
      todoTasks: todo,
      progress,
    }

    setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)))
    offlineStore.setTasks(activePlan.id, combinedTasks)
    offlineStore.setSuggestions(activePlan.id, remainingSuggestions)

    toast.success(
      `Lote de ${newTasks.length} tarefa(s) confirmado com sucesso (201 Created)!`
    )

    const dto = {
      tasks: selectedSuggestions.map((s) => ({
        title: s.title,
        description: s.description || undefined,
        dueDate: s.dueDate || undefined,
      })),
    }

    try {
      if (navigator.onLine) {
        await api.suggestions.accept(activePlan.id, dto)
      } else {
        offlineStore.enqueueOutbox({
          id: `outbox-${Date.now()}`,
          type: "acceptSuggestions",
          planId: activePlan.id,
          payload: dto,
          timestamp: Date.now(),
        })
      }
    } catch (err) {
      console.warn("Falha ao aceitar lote no backend, enfileirando outbox:", err)
      offlineStore.enqueueOutbox({
        id: `outbox-${Date.now()}`,
        type: "acceptSuggestions",
        planId: activePlan.id,
        payload: dto,
        timestamp: Date.now(),
      })
    }
  }, [activePlan])

  const discardSuggestions = React.useCallback(() => {
    if (!activePlan) return
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === activePlan.id ? { ...plan, copilotSuggestions: [] } : plan
      )
    )
    offlineStore.setSuggestions(activePlan.id, [])
    toast("Sugestões descartadas.")
  }, [activePlan])

  const generateAiSuggestions = React.useCallback(
    async (maxSuggestions: number = 10) => {
      if (!activePlan) return
      setIsGeneratingAi(true)
      setLastAiError(null)

      try {
        if (!navigator.onLine) {
          throw new ApiError(0, "Sem conexão com a internet.")
        }

        const res = await api.suggestions.generate(activePlan.id, {
          maxSuggestions,
        })

        const mapped: CopilotSuggestion[] = res.suggestions.map((s, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          title: s.title,
          description: s.description ?? undefined,
          dueDate: s.dueDate ?? activePlan.movingDate,
          selected: true,
        }))

        setPlans((prev) =>
          prev.map((plan) =>
            plan.id === activePlan.id
              ? { ...plan, copilotSuggestions: mapped }
              : plan
          )
        )
        offlineStore.setSuggestions(activePlan.id, mapped)
        toast.success(
          `${mapped.length} sugestões geradas pelo Copiloto IA.`
        )
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setLastAiError(err)
          if (err.isThrottled) {
            toast.error(
              "Limite de requisições excedido (HTTP 429). Aguarde 1 minuto."
            )
          } else if (err.isTimeoutOrUnavailable) {
            toast.error(
              "Serviço de IA indisponível ou tempo limite esgotado (15s)."
            )
          } else {
            toast.error(err.message)
          }
        } else {
          toast.error("Erro inesperado ao gerar sugestões.")
        }
      } finally {
        setIsGeneratingAi(false)
      }
    },
    [activePlan]
  )

  const createNewPlan = React.useCallback(
    async (dto: CreateMovingPlanDto): Promise<MovingPlan> => {
      const tempId = `plan-${Date.now()}`
      let createdUiPlan: MovingPlan

      if (navigator.onLine) {
        try {
          const res = await api.movingPlans.create(dto)
          createdUiPlan = mapBackendPlanToUi(res, [], plans.length)
        } catch {
          createdUiPlan = mapBackendPlanToUi(
            {
              id: tempId,
              title: dto.title,
              origin: dto.origin,
              destination: dto.destination,
              movingDate: dto.movingDate,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            [],
            plans.length
          )
          offlineStore.enqueueOutbox({
            id: `outbox-${Date.now()}`,
            type: "createPlan",
            tempPlanId: tempId,
            payload: dto,
            timestamp: Date.now(),
          })
        }
      } else {
        createdUiPlan = mapBackendPlanToUi(
          {
            id: tempId,
            title: dto.title,
            origin: dto.origin,
            destination: dto.destination,
            movingDate: dto.movingDate,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          [],
          plans.length
        )
        offlineStore.enqueueOutbox({
          id: `outbox-${Date.now()}`,
          type: "createPlan",
          tempPlanId: tempId,
          payload: dto,
          timestamp: Date.now(),
        })
      }

      setPlans((prev) => {
        const updated = [createdUiPlan, ...prev]
        offlineStore.setPlans(updated)
        return updated
      })

      setActivePlanId(createdUiPlan.id)
      return createdUiPlan
    },
    [plans.length]
  )

  const deletePlan = React.useCallback(
    async (planId: string): Promise<boolean> => {
      // 1. Atualização Otimista
      const remainingPlans = plans.filter((p) => p.id !== planId)
      setPlans(remainingPlans)
      offlineStore.removePlan(planId)

      if (activePlanId === planId) {
        setActivePlanId(remainingPlans.length > 0 ? remainingPlans[0].id : "")
      }

      toast.success("Plano de mudança excluído com sucesso.")

      // 2. Persistência no Backend ou Outbox
      try {
        if (navigator.onLine) {
          await api.movingPlans.delete(planId)
        } else {
          offlineStore.enqueueOutbox({
            id: `outbox-${Date.now()}`,
            type: "deletePlan",
            planId,
            timestamp: Date.now(),
          })
        }
      } catch (err) {
        console.warn("Falha ao excluir plano no backend, enfileirando outbox:", err)
        offlineStore.enqueueOutbox({
          id: `outbox-${Date.now()}`,
          type: "deletePlan",
          planId,
          timestamp: Date.now(),
        })
      }

      return true
    },
    [plans, activePlanId]
  )

  const clearAiError = React.useCallback(() => setLastAiError(null), [])

  const value = React.useMemo<WorkspaceStoreValue>(
    () => ({
      plans,
      activePlanId,
      activePlan,
      quickFilter,
      checklistTab,
      isGeneratingAi,
      isOnline,
      isSyncing,
      isLoadingPlans,
      lastAiError,
      aiConfig,
      clearAiError,
      selectPlan,
      setQuickFilter,
      setChecklistTab,
      cycleTaskStatus,
      addQuickTask,
      deleteTask,
      toggleSuggestion,
      acceptSuggestionsBatch,
      discardSuggestions,
      generateAiSuggestions,
      createNewPlan,
      deletePlan,
      refreshActivePlanTasks,
      refreshPlans,
    }),
    [
      plans,
      activePlanId,
      activePlan,
      quickFilter,
      checklistTab,
      isGeneratingAi,
      isOnline,
      isSyncing,
      isLoadingPlans,
      lastAiError,
      aiConfig,
      clearAiError,
      selectPlan,
      setQuickFilter,
      cycleTaskStatus,
      addQuickTask,
      deleteTask,
      toggleSuggestion,
      acceptSuggestionsBatch,
      discardSuggestions,
      generateAiSuggestions,
      createNewPlan,
      deletePlan,
      refreshActivePlanTasks,
      refreshPlans,
    ]
  )

  return (
    <WorkspaceStoreContext.Provider value={value}>
      {children}
    </WorkspaceStoreContext.Provider>
  )
}

export function useWorkspaceStore(): WorkspaceStoreValue {
  const ctx = React.useContext(WorkspaceStoreContext)
  if (!ctx) {
    throw new Error(
      "useWorkspaceStore must be used within a WorkspaceProvider"
    )
  }
  return ctx
}
