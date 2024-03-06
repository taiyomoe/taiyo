export type LayoutProps = { children: React.ReactNode }

export type InferNestedPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? InferNestedPaths<T[K], `${Prefix & string}${K & string}.`>
    : `${Prefix & string}${K & string}`
}[keyof T]

export type InferNestedValues<T> = T extends object
  ? { [K in keyof T]: InferNestedValues<T[K]> }[keyof T]
  : T

export type DateRangeKey =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
