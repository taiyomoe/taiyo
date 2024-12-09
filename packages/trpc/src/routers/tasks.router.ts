import { getAllTasksHandler } from "../handlers/get-all-tasks.handler"
import { getTasksBySessionIdHandler } from "../handlers/get-tasks-by-session-id.handler"
import { createTRPCRouter } from "../trpc"

export const tasksRouter = createTRPCRouter({
  getAll: getAllTasksHandler,
  getBySessionId: getTasksBySessionIdHandler,
})
