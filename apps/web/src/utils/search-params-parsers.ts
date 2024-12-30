import {
  type ParserBuilder,
  createParser,
  parseAsArrayOf,
  parseAsStringEnum,
  parseAsStringLiteral,
} from "nuqs/server"
import { z } from "zod"

const parseAsIsoDate = createParser({
  parse: (v) => {
    const date = new Date(v.slice(0, 10))
    if (Number.isNaN(date.valueOf())) {
      return null
    }
    return date
  },
  serialize: (v: Date) => {
    const offsetMs = v.getTimezoneOffset() * 60 * 1000
    const date = new Date(v.getTime() - offsetMs)

    return date.toISOString().slice(0, 10)
  },
})

export const enumFilterParser = <
  TName extends string,
  TData extends Record<string, string>,
  TValues extends TData[keyof TData],
>(
  name: TName,
  data: TData,
) => {
  const values = Object.values(data) as TValues[]
  const mainParser = parseAsStringEnum<TValues>(values)

  return {
    [`${name}.equals`]: mainParser,
    [`${name}.not`]: mainParser,
    [`${name}.in`]: parseAsArrayOf(mainParser),
    [`${name}.notIn`]: parseAsArrayOf(mainParser),
  } as {
    [K in
      | `${TName}.equals`
      | `${TName}.not`
      | `${TName}.in`
      | `${TName}.notIn`]: K extends `${TName}.equals` | `${TName}.not`
      ? ParserBuilder<TValues>
      : ParserBuilder<TValues[]>
  }
}

export const dateFilterParser = <TName extends string>(name: TName) =>
  ({
    [`${name}.lt`]: parseAsIsoDate,
    [`${name}.gt`]: parseAsIsoDate,
  }) as {
    [K in `${TName}.lt` | `${TName}.gt`]: ParserBuilder<Date>
  }

export const nullableDateFilterParser = <TName extends string>(name: TName) =>
  ({
    [`${name}.equals`]: parseAsStringLiteral(["null", "notNull"]).withDefault(
      "null",
    ),
    [`${name}.lt`]: parseAsIsoDate,
    [`${name}.gt`]: parseAsIsoDate,
  }) as {
    [K in TName | `${TName}.lt` | `${TName}.gt`]: ParserBuilder<
      "null" | "notNull" | Date
    >
  }

export const sortParser = (sorteableFields: readonly [string, ...string[]]) =>
  createParser({
    parse: (v) => {
      const schema = z
        .tuple([z.enum(sorteableFields), z.enum(["asc", "desc"])])
        .array()
      const parsed = schema.safeParse(JSON.parse(v))

      if (parsed.error) {
        return null
      }

      return parsed.data
    },
    serialize: (v) => JSON.stringify(v),
    eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  })
