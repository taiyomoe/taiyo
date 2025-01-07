import type { UseQueryStatesKeysMap } from "nuqs"
import { assign, crush, mapValues, omit } from "radash"

export const normalizeSearchParams = (
  parser: UseQueryStatesKeysMap,
  input: Record<string, unknown>,
) => {
  const emptySearchParams: Record<string, unknown> = mapValues(
    parser,
    () => null,
  )
  const searchParams = assign(emptySearchParams, {
    ...crush(omit(input, ["sort"])),
    sort: input.sort,
  })

  return searchParams
}
