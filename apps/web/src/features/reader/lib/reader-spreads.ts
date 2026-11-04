export const buildSpreads = (
  pageCount: number,
  {
    double,
    firstPageAlone,
    widePages,
  }: { double: boolean; firstPageAlone: boolean; widePages: ReadonlySet<number> },
) => {
  const spreads: number[][] = []

  for (let page = 0; page < pageCount;) {
    const alone =
      !double ||
      (page === 0 && firstPageAlone) ||
      page === pageCount - 1 ||
      widePages.has(page) ||
      widePages.has(page + 1)

    spreads.push(alone ? [page] : [page, page + 1])
    page += alone ? 1 : 2
  }

  return spreads
}

export const findSpreadIndex = (spreads: ReadonlyArray<readonly number[]>, page: number) =>
  Math.max(
    0,
    spreads.findIndex((spread) => spread.includes(page)),
  )
