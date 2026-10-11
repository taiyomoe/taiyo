export type PageItem = number | "ellipsis-start" | "ellipsis-end"

export const getPageCount = (total: number, perPage: number) =>
  Math.max(Math.ceil(total / perPage), 1)

export const getPageItems = (page: number, pageCount: number, siblings = 1): PageItem[] => {
  const first = 1
  const last = pageCount
  const start = Math.max(page - siblings, first + 1)
  const end = Math.min(page + siblings, last - 1)
  const middle = Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i)

  if (pageCount <= 1) {
    return [first]
  }

  return [
    first,
    ...(start > first + 1 ? (["ellipsis-start"] as const) : []),
    ...middle,
    ...(end < last - 1 ? (["ellipsis-end"] as const) : []),
    last,
  ]
}
