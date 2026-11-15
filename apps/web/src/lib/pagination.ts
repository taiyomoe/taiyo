import { range } from "remeda"

const SIBLINGS = 1

export type PageItem = number | { gapAfter: number }

export const getPageItems = (page: number, pageCount: number): PageItem[] => {
  const slots = SIBLINGS * 2 + 5

  if (pageCount <= slots) {
    return range(1, pageCount + 1)
  }

  const edge = slots - 2

  if (page <= edge - SIBLINGS) {
    return [...range(1, edge + 1), { gapAfter: edge }, pageCount]
  }

  if (page > pageCount - edge + SIBLINGS) {
    return [1, { gapAfter: 1 }, ...range(pageCount - edge + 1, pageCount + 1)]
  }

  return [
    1,
    { gapAfter: 1 },
    ...range(page - SIBLINGS, page + SIBLINGS + 1),
    { gapAfter: page + SIBLINGS },
    pageCount,
  ]
}

export const parsePage = (input: string, pageCount: number) => {
  if (!/^\d+$/.test(input)) {
    return null
  }

  const page = Number(input)

  return page >= 1 && page <= pageCount ? page : null
}
