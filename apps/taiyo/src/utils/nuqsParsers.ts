import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import {
  type ParserBuilder,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs"
import { camel } from "radash"
import type { ZodSchema } from "zod"

export const intsParser = parseAsArrayOf(parseAsInteger).withDefault([])
export const uuidsParser = parseAsArrayOf(parseAsString).withDefault([])
export const pageParser = parseAsInteger.withDefault(1)
export const perPageParser = (defaultValue: number) =>
  parseAsInteger.withDefault(defaultValue)

export const languagesParser = parseAsArrayOf(
  parseAsStringEnum(Object.values(Languages)),
).withDefault([])
export const contentRatingsParser = parseAsArrayOf(
  parseAsStringEnum(Object.values(ContentRating)),
).withDefault([])
export const flagsParser = parseAsArrayOf(
  parseAsStringEnum(Object.values(Flag)),
).withDefault([])

export const megaParser = <TSchema extends ZodSchema>(
  searchParams: Record<string, string>,
  schema: TSchema,
  // biome-ignore lint/suspicious/noExplicitAny: we allow any here because we validate data with zod afterwards so it's fine
  fields: ([string, ParserBuilder<any>] | [string, ParserBuilder<any>, true])[],
): TSchema["_type"] => {
  const items: Record<string, unknown> = {}
  const mappedFields = fields.map(([key, parser, canBeNegated]) => ({
    [key]: parser.parseServerSide(searchParams[key]),
    ...(canBeNegated && {
      [camel(`not ${key}`)]: parser.parseServerSide(
        searchParams[camel(`not ${key}`)],
      ),
    }),
  }))

  for (const [_, obj] of Object.entries(mappedFields))
    for (const [k, v] of Object.entries(obj)) items[k] = v

  return schema.parse(items)
}
