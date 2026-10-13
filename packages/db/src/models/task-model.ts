import type { Generated, Insertable } from "kysely"
import type { TaskStatus, TaskType } from "../constants"
import type { GeneratedTimestamp, Json } from "../types"

export type Task = {
  id: Generated<string>
  createdAt: GeneratedTimestamp
  updatedAt: GeneratedTimestamp
  type: TaskType
  status: TaskStatus
  payload: Json
  sessionId: string
}

export type NewTask = Insertable<Task>
