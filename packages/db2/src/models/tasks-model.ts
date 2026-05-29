import type { Generated, Insertable } from "kysely"
import type { TaskStatus, TaskType } from "../constants"
import type { Json, Timestamp } from "../types"

export interface Tasks {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  updatedAt: Timestamp
  type: TaskType
  status: TaskStatus
  payload: Json
  sessionId: string
}

export type NewTasks = Insertable<Tasks>
