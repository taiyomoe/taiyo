import { getTasksBySessionIdHandler } from "../handlers/get-tasks-by-session-id.handler"
import { getTasksListHandler } from "../handlers/get-tasks-list.handler"
import { createTRPCRouter } from "../trpc"

export const tasksRouter = createTRPCRouter({
  getList: getTasksListHandler,
  getBySessionId: getTasksBySessionIdHandler,
})
