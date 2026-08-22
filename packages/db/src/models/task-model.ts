import type { Generated, Insertable } from "kysely"
import type { TaskStatus, TaskType } from "../constants"
import type { Json, Timestamp } from "../types"

export interface Task {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Generated<Timestamp>
  type: TaskType
  status: TaskStatus
  payload: Json
  sessionId: string
}

export type NewTask = Insertable<Task>
