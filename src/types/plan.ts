export type TaskStatus = "DONE" | "IN_PROGRESS" | "TODO"

export type TaskIconKey =
  | "doc-check"
  | "circle-check"
  | "truck"
  | "box"
  | "key"
  | "inspect"

export interface TaskItem {
  id: string
  title: string
  description: string
  dueDate: string
  status: TaskStatus
  icon: TaskIconKey
  highlighted?: boolean
}

export interface CopilotSuggestion {
  id: string
  title: string
  description?: string
  category?: string
  dueDate: string
  selected: boolean
}

export interface MovingPlan {
  id: string
  slug: string
  sidebarTitle: string
  title: string
  origin: string
  destination: string
  shortRoute: string
  movingDate: string
  daysRemaining: number
  progress: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  sidebarIcon: "home" | "doc" | "box"
  tasks: TaskItem[]
  copilotSuggestions: CopilotSuggestion[]
}
