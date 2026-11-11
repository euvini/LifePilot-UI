import type {
  AcceptTaskSuggestionsDto,
  AiConfigResponse,
  AuthResponseDto,
  CreateMovingPlanDto,
  CreateTaskDto,
  GenerateTaskSuggestionsDto,
  HealthResponse,
  LoginDto,
  MovingPlanResponse,
  RefreshTokenDto,
  SignUpDto,
  TaskResponse,
  TaskSuggestionsResponse,
  TokenResponseDto,
  UpdateTaskDto,
  UserResponseDto,
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

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isTimeoutOrUnavailable(): boolean {
    return this.status === 503 || this.status === 504 || this.status === 502
  }
}

const DEFAULT_TIMEOUT_MS = 10000
const AI_TIMEOUT_MS = 20000

const TOKEN_KEY = "lifepilot_auth_token"
const REFRESH_TOKEN_KEY = "lifepilot_refresh_token"

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TOKEN_KEY, accessToken)
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  } catch {
    // LocalStorage indisponível
  }
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // LocalStorage indisponível
  }
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function requestRefreshSession(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken()
  if (!refreshToken) {
    clearStoredTokens()
    return null
  }

  try {
    const baseUrl =
      typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1")
        : (process.env.BACKEND_URL || "http://localhost:3333") + "/api/v1"

    const url = `${baseUrl.replace(/\/$/, "")}/auth/refresh`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      clearStoredTokens()
      return null
    }

    const data = (await res.json()) as TokenResponseDto
    setStoredTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    clearStoredTokens()
    return null
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  isRetry = false
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const baseUrl =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL || "/api/v1")
      : (process.env.BACKEND_URL || "http://localhost:3333") + "/api/v1"

  const url = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`

  // Injeta automaticamente o token de autorização se presente
  const currentToken = getStoredAccessToken()
  const existingHeaders = (options.headers as Record<string, string>) || {}
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(currentToken && !existingHeaders["Authorization"]
      ? { Authorization: `Bearer ${currentToken}` }
      : {}),
    ...existingHeaders,
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    })

    // Caso receba 401 Unauthorized e tenha refresh token (e não seja rota de auth nem retry)
    if (res.status === 401 && !isRetry && !endpoint.startsWith("auth/")) {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = requestRefreshSession().finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
      }

      const newAccessToken = await refreshPromise
      if (newAccessToken) {
        return request<T>(
          endpoint,
          {
            ...options,
            headers: {
              ...existingHeaders,
              Authorization: `Bearer ${newAccessToken}`,
            },
          },
          timeoutMs,
          true
        )
      }
    }

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
  auth: {
    signUp: (dto: SignUpDto) =>
      request<AuthResponseDto>("auth/signup", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    login: (dto: LoginDto) =>
      request<AuthResponseDto>("auth/login", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    refresh: (dto: RefreshTokenDto) =>
      request<TokenResponseDto>("auth/refresh", {
        method: "POST",
        body: JSON.stringify(dto),
      }),
    me: () =>
      request<UserResponseDto>("auth/me", {
        method: "GET",
      }),
    logout: () =>
      request<void>("auth/logout", {
        method: "POST",
      }),
  },

  health: {
    check: () => request<HealthResponse>("health", { method: "GET" }, 5000),
    ai: () => request<AiConfigResponse>("health/ai", { method: "GET" }, 5000),
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
    delete: (id: string) =>
      request<void>(`moving-plans/${id}`, {
        method: "DELETE",
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
