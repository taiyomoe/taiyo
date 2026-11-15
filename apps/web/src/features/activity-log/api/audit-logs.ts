import type { AuditLogHistogramInterval } from "@taiyomoe/audit/query"
import type { InferResponseType } from "hono/client"
import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { getApiErrorCode, unwrapEnvelope } from "@/lib/envelope"

export type AuditLogScope = { q: string; from: string; to: string }

const toQuery = ({ q, from, to }: AuditLogScope) => ({ ...(q === "" ? {} : { q }), from, to })
const retry = (failureCount: number, error: unknown) =>
  getApiErrorCode(error) !== "VALIDATION_ERROR" && failureCount < 1

export const auditLogsQueryOptions = (
  scope: AuditLogScope,
  { page, perPage, sort }: { page: number; perPage: number; sort: "asc" | "desc" },
) =>
  queryOptions({
    queryKey: ["audit-logs", "list", scope, { page, perPage, sort }],
    queryFn: async ({ signal }) => {
      const response = await api["audit-logs"].$get(
        { query: { ...toQuery(scope), page: String(page), perPage: String(perPage), sort } },
        { init: { signal } },
      )
      const { data, meta } =
        await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)

      return { entries: data, total: meta.total }
    },
    placeholderData: keepPreviousData,
    retry,
  })

export const auditLogGroupsQueryOptions = (
  scope: AuditLogScope,
  { page, perPage, sort }: { page: number; perPage: number; sort: "asc" | "desc" },
) =>
  queryOptions({
    queryKey: ["audit-logs", "groups", scope, { page, perPage, sort }],
    queryFn: async ({ signal }) => {
      const response = await api["audit-logs"].groups.$get(
        { query: { ...toQuery(scope), page: String(page), perPage: String(perPage), sort } },
        { init: { signal } },
      )
      const { data, meta } =
        await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)

      return { groups: data, total: meta.total, entries: meta.entries }
    },
    placeholderData: keepPreviousData,
    retry,
  })

export const auditLogHistogramQueryOptions = (
  scope: AuditLogScope,
  interval: AuditLogHistogramInterval,
  timeZone: string,
) =>
  queryOptions({
    queryKey: ["audit-logs", "histogram", scope, { interval, timeZone }],
    queryFn: async ({ signal }) => {
      const response = await api["audit-logs"].histogram.$get(
        { query: { ...toQuery(scope), interval, tz: timeZone } },
        { init: { signal } },
      )

      return (await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)).data
    },
    placeholderData: keepPreviousData,
    retry,
  })

export const auditLogFacetsQueryOptions = (scope: AuditLogScope) =>
  queryOptions({
    queryKey: ["audit-logs", "facets", scope],
    queryFn: async ({ signal }) => {
      const response = await api["audit-logs"].facets.$get(
        { query: toQuery(scope) },
        { init: { signal } },
      )

      return (await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)).data
    },
    placeholderData: keepPreviousData,
    retry,
  })

export const auditLogSuggestionsQueryOptions = (field: string, query: string) =>
  queryOptions({
    queryKey: ["audit-logs", "suggestions", { field, query }],
    queryFn: async ({ signal }) => {
      const response = await api["audit-logs"].suggestions.$get(
        { query: { field, query } },
        { init: { signal } },
      )

      return (await unwrapEnvelope<Awaited<ReturnType<typeof response.json>>>(response)).data
    },
    placeholderData: keepPreviousData,
    retry,
    staleTime: 60_000,
  })

export type AuditLogEntry = InferResponseType<
  (typeof api)["audit-logs"]["$get"],
  200
>["data"][number]

export type AuditLogHistogram = InferResponseType<
  (typeof api)["audit-logs"]["histogram"]["$get"],
  200
>["data"]

export type AuditLogFacets = InferResponseType<
  (typeof api)["audit-logs"]["facets"]["$get"],
  200
>["data"]
