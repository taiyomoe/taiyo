import { updateHistoryProgressionHandler } from "../handlers/update-history-progression.handler"
import { createTRPCRouter } from "../trpc"

export const historyRouter = createTRPCRouter({
  updateProgression: updateHistoryProgressionHandler,
})
