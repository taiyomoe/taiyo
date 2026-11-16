import { config } from "@taiyomoe/config"
import z from "zod"

export const bulkIdsSchema = (noun: string, examples: [string, string]) =>
  z
    .array(z.uuid())
    .min(1)
    .max(config.input.maxBulkBatch)
    .transform((ids) => [...new Set(ids)])
    .meta({
      description: `The IDs of the ${noun} to act on, ${config.input.maxBulkBatch} at most. Duplicates are ignored.`,
      example: examples,
    })

export const skippedSchema = <const TReason extends string>(
  noun: string,
  reasons: readonly [TReason, ...TReason[]],
  description: string,
) =>
  z.object({
    id: z.uuid().meta({ description: `The ID of the ${noun}.` }),
    reason: z.enum(reasons).meta({ description, example: reasons[0] }),
  })

export const bulkResultSchema = <TSkipped extends z.ZodType>(
  noun: string,
  done: string,
  skipped: TSkipped,
) =>
  z.object({
    done: z
      .uuid()
      .array()
      .meta({ description: `The IDs of the ${noun} that were ${done}.` }),
    skipped: skipped.array().meta({ description: `The ${noun} that were left alone, and why.` }),
  })

/** Splits the requested IDs into the ones found and the ones reported as missing. */
export const partitionFound = <TRow extends { id: string }>(
  ids: readonly string[],
  rows: readonly TRow[],
) => {
  const found = new Map(rows.map((row) => [row.id, row]))

  return {
    found: ids.flatMap((id) => {
      const row = found.get(id)

      return row === undefined ? [] : [row]
    }),
    missing: ids.filter((id) => !found.has(id)),
  }
}

/** A comma-separated list of IDs in a query string. */
export const idsQuerySchema = (noun: string, examples: [string, string]) =>
  z
    .string()
    .transform((value) => value.split(",").filter((id) => id !== ""))
    .pipe(
      z
        .array(z.uuid())
        .min(1)
        .max(config.input.maxBulkBatch)
        .transform((ids) => [...new Set(ids)]),
    )
    .meta({
      description: `The IDs of the ${noun}, separated by commas, ${config.input.maxBulkBatch} at most.`,
      example: examples.join(","),
    })
