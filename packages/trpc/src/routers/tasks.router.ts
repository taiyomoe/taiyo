import { getTasksBySessionIdHandler } from "../handlers/get-tasks-by-session-id.handler"
import { createTRPCRouter } from "../trpc"

export const tasksRouter = createTRPCRouter({
  getBySessionId: getTasksBySessionIdHandler,
})
