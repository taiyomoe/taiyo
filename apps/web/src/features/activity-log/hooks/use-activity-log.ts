import { type KqlSyntaxError, parseKql } from "@taiyomoe/audit/query"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useActivityLogResults } from "@/features/activity-log/hooks/use-activity-log-results"
import {
  type ActivityLogSearch,
  DEFAULT_FROM,
  DEFAULT_QUERY,
  DEFAULT_TO,
  getGroupRange,
  getGroupViewQuery,
  type LogGroup,
  pickHistogramInterval,
  REFRESH_INTERVAL_MS,
} from "@/features/activity-log/lib/activity-log"
import { withoutDefaults } from "@/features/activity-log/lib/activity-log-search"
import { resolveDateRange } from "@/features/activity-log/lib/datemath"
import { describeDateMath, describeRange } from "@/features/activity-log/lib/format"
import { andClauses, matchClause } from "@/features/activity-log/lib/kql-query"
import { useClientValue } from "@/hooks/use-client-value"

export function useActivityLog(search: ActivityLogSearch) {
  const navigate = useNavigate({ from: "/dashboard/activity-log" })
  const queryClient = useQueryClient()
  const from = search.from ?? DEFAULT_FROM
  const to = search.to ?? DEFAULT_TO
  const query = search.q ?? DEFAULT_QUERY
  const page = search.page ?? 1
  const sort: "asc" | "desc" = search.sort === "asc" ? "asc" : "desc"
  const [draft, setDraft] = useState(query)
  const [draftFor, setDraftFor] = useState(query)
  const [syntaxError, setSyntaxError] = useState<KqlSyntaxError | null>(null)
  const [anchor, setAnchor] = useState(() => Date.now())
  const timeZone = useClientValue(() => new Intl.DateTimeFormat().resolvedOptions().timeZone)

  if (draftFor !== query) {
    setDraftFor(query)
    setDraft(query)
    setSyntaxError(null)
  }

  useEffect(() => {
    if (search.refresh === undefined) {
      return undefined
    }

    const interval = setInterval(() => {
      setAnchor(Date.now())
    }, REFRESH_INTERVAL_MS[search.refresh])

    return () => {
      clearInterval(interval)
    }
  }, [search.refresh])

  const range = useMemo(() => resolveDateRange(from, to, anchor), [from, to, anchor])
  const scope = useMemo(
    () =>
      range === null
        ? null
        : {
            q: query,
            from: range.from.toISOString(),
            to: range.to.toISOString(),
          },
    [range, query],
  )
  const span = range === null ? 0 : range.to.getTime() - range.from.getTime()
  const interval = pickHistogramInterval(span)
  const grouping = search.grouping !== "off"
  const results = useActivityLogResults({ scope, interval, timeZone, grouping, page, sort })
  const update = useCallback(
    (patch: Partial<ActivityLogSearch>, { keepPage = false } = {}) => {
      if ("from" in patch || "to" in patch) {
        setAnchor(Date.now())
      }

      void navigate({
        search: (previous) =>
          withoutDefaults({ ...previous, ...(keepPage ? {} : { page: undefined }), ...patch }),
        resetScroll: false,
      })
    },
    [navigate],
  )
  const addFilter = useCallback(
    (field: string, value: string, negate: boolean) => {
      update({ q: andClauses(query, [matchClause(field, value, negate)]) })
    },
    [query, update],
  )
  const zoom = useCallback(
    (next: { from: string; to: string }) => {
      update({ from: next.from, to: next.to })
    },
    [update],
  )
  const submit = (text: string) => {
    const result = parseKql(text)

    if (!result.ok) {
      setSyntaxError(result.error)

      return
    }

    setSyntaxError(null)

    if (text === query) {
      setAnchor(Date.now())
      void queryClient.invalidateQueries({ queryKey: ["audit-logs"] })
    } else {
      update({ q: text })
    }
  }
  const changeDraft = (text: string) => {
    setDraft(text)

    if (syntaxError !== null) {
      setSyntaxError(null)
    }
  }
  const viewGroup = (group: LogGroup) => {
    update({
      ...getGroupRange(group),
      q: getGroupViewQuery(query, group),
      grouping: "off",
    })
  }

  return {
    ...results,
    from,
    to,
    query,
    page,
    sort,
    draft,
    range,
    scope,
    span,
    interval,
    grouping,
    queryIssue: syntaxError ?? results.serverIssue,
    rangeLabel: describeRange(from, to) ?? `${describeDateMath(from)} → ${describeDateMath(to)}`,
    update,
    addFilter,
    zoom,
    submit,
    changeDraft,
    viewGroup,
  }
}

export type UpdateSearch = ReturnType<typeof useActivityLog>["update"]
