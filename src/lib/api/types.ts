export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

export interface MovingPlanResponse {
  id: string
  title: string
  origin: string
  destination: string
  movingDate: string // YYYY-MM-DD
  createdAt: string
  updatedAt: string
}

export interface CreateMovingPlanDto {
  title: string
  origin: string
  destination: string
  movingDate: string // YYYY-MM-DD
}

export interface TaskResponse {
  id: string
  movingPlanId: string
  title: string
  description: string | null
  dueDate: string | null // YYYY-MM-DD
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string | null
  dueDate?: string | null
  status?: TaskStatus
}

export interface UpdateTaskDto {
  title?: string
  description?: string | null
  dueDate?: string | null
  status?: TaskStatus
}

export interface TaskSuggestionItem {
  title: string
  description: string | null
  dueDate: string | null
}

export interface TaskSuggestionsResponse {
  movingPlanId: string
  generatedAt: string
  suggestions: TaskSuggestionItem[]
}

export interface GenerateTaskSuggestionsDto {
  maxSuggestions?: number
}

export interface AcceptedTaskItemDto {
  title: string
  description?: string | null
  dueDate?: string | null
}

export interface AcceptTaskSuggestionsDto {
  tasks: AcceptedTaskItemDto[]
}

export interface HealthResponse {
  status: string
  service: string
  timestamp: string
}

export interface AiConfigResponse {
  status: string
  provider: string
  model: string
  baseUrl: string
  isCloud: boolean
  label: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}

// ═══════════════════════════════════════════════════════════════
// AUTH DTOs & RESPONSES
// ═══════════════════════════════════════════════════════════════

export interface SignUpDto {
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface UserResponseDto {
  id: string
  email: string
  userMetadata?: Record<string, unknown>
  createdAt?: string
}

export interface AuthResponseDto {
  user: UserResponseDto
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType: string
}

export interface TokenResponseDto {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType: string
}
