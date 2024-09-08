import { rawLogsClient } from "./"

export const insertWrapper = (
  table: string,
  columns: string[],
  input: unknown[],
) =>
  rawLogsClient.insert({
    table,
    values: [columns, input],
    format: "JSONCompactEachRowWithNames",
  })
