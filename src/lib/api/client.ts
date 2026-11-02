import type {
  AcceptTaskSuggestionsDto,
  CreateMovingPlanDto,
  CreateTaskDto,
  GenerateTaskSuggestionsDto,
  HealthResponse,
  MovingPlanResponse,
  TaskResponse,
  TaskSuggestionsResponse,
  UpdateTaskDto,
} from "./types"

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }

  get isThrottled(): boolean {
    return this.status === 429
  }

  get isTimeoutOrUnavailable(): boolean {
    return this.status === 503 || this.status === 504 || this.status === 502
  }
}

const DEFAULT_TIMEOUT_MS = 10000
const AI_TIMEOUT_MS = 20000

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const baseUrl =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1")
      : (process.env.BACKEND_URL || "http://localhost:3333") + "/api/v1"

  const url = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!res.ok) {
      let errorMessage = `Erro HTTP ${res.status}`
      let details: unknown

      try {
        const errorJson = await res.json()
        details = errorJson
        if (Array.isArray(errorJson.message)) {
          errorMessage = errorJson.message.join(" · ")
        } else if (typeof errorJson.message === "string") {
          errorMessage = errorJson.message
        }
      } catch {
        // Ignora falha de parse
      }

      throw new ApiError(res.status, errorMessage, details)
    }

    if (res.status === 204) {
      return undefined as T
    }

    return (await res.json()) as T
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        504,
        "Tempo esgotado ao comunicar com o servidor (timeout). Tente novamente."
      )
    }

    const message =
      err instanceof Error ? err.message : "Falha na conexão de rede"
    throw new ApiError(0, message)
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  health: {
    check: () => request<HealthResponse>("health", { method: "GET" }, 5000),
  },

  movingPlans: {
    list: () => request<MovingPlanResponse[]>("moving-plans", { method: "GET" }),
    get: (id: string) =>
      request<MovingPlanResponse>(`moving-plans/${id}`, { method: "GET" }),
    create: (dto: CreateMovingPlanDto) =>
      request<MovingPlanResponse>("moving-plans", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
  },

  tasks: {
    list: (planId: string) =>
      request<TaskResponse[]>(`moving-plans/${planId}/tasks`, {
        method: "GET",
      }),
    get: (planId: string, taskId: string) =>
      request<TaskResponse>(`moving-plans/${planId}/tasks/${taskId}`, {
        method: "GET",
      }),
    create: (planId: string, dto: CreateTaskDto) =>
      request<TaskResponse>(`moving-plans/${planId}/tasks`, {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    update: (planId: string, taskId: string, dto: UpdateTaskDto) =>
      request<TaskResponse>(`moving-plans/${planId}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(dto),
      }),
    delete: (planId: string, taskId: string) =>
      request<void>(`moving-plans/${planId}/tasks/${taskId}`, {
        method: "DELETE",
      }),
  },

  suggestions: {
    generate: (planId: string, dto?: GenerateTaskSuggestionsDto) =>
      request<TaskSuggestionsResponse>(
        `moving-plans/${planId}/task-suggestions`,
        {
          method: "POST",
          body: JSON.stringify(dto ?? {}),
        },
        AI_TIMEOUT_MS
      ),
    accept: (planId: string, dto: AcceptTaskSuggestionsDto) =>
      request<TaskResponse[]>(
        `moving-plans/${planId}/task-suggestions/accept`,
        {
          method: "POST",
          body: JSON.stringify(dto),
        }
      ),
  },
}
