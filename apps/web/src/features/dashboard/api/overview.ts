import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type { DashboardRange } from "@/features/dashboard/lib/dashboard"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"

export const dashboardOverviewQueryOptions = (range: DashboardRange, timeZone: string | null) =>
  queryOptions({
    queryKey: ["dashboard", "overview", { range, timeZone }],
    queryFn: async ({ signal }) =>
      unwrap(
        await api.dashboard.overview.$get(
          { query: { range, tz: timeZone ?? "UTC" } },
          { init: { signal } },
        ),
      ),
    enabled: timeZone !== null,
    placeholderData: keepPreviousData,
  })

export type DashboardOverview = InferResponseType<typeof api.dashboard.overview.$get, 200>["data"]
