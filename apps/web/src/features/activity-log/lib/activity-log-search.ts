import type { KqlSyntaxError } from "@taiyomoe/audit/query"
import {
  type ActivityLogSearch,
  DEFAULT_FROM,
  DEFAULT_QUERY,
  DEFAULT_TO,
} from "@/features/activity-log/lib/activity-log"

export const getQueryIssue = (error: unknown): KqlSyntaxError | null => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("details" in error) ||
    !Array.isArray(error.details)
  ) {
    return null
  }

  const details: readonly unknown[] = error.details
  const issue = details[0]

  if (
    typeof issue === "object" &&
    issue !== null &&
    "path" in issue &&
    Array.isArray(issue.path) &&
    issue.path.includes("q") &&
    "message" in issue &&
    typeof issue.message === "string"
  ) {
    const start = "start" in issue && typeof issue.start === "number" ? issue.start : 0
    const end = "end" in issue && typeof issue.end === "number" ? issue.end : start

    return { message: issue.message, start, end }
  }

  return null
}

export const withoutDefaults = (search: ActivityLogSearch): ActivityLogSearch => ({
  ...(search.q === undefined || search.q === DEFAULT_QUERY ? {} : { q: search.q }),
  ...(search.from === undefined || search.from === DEFAULT_FROM ? {} : { from: search.from }),
  ...(search.to === undefined || search.to === DEFAULT_TO ? {} : { to: search.to }),
  ...(search.page === undefined || search.page === 1 ? {} : { page: search.page }),
  ...(search.sort === undefined ? {} : { sort: search.sort }),
  ...(search.refresh === undefined ? {} : { refresh: search.refresh }),
  ...(search.grouping === undefined ? {} : { grouping: search.grouping }),
})
