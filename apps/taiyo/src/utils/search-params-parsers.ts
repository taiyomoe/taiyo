import {
  type ParserBuilder,
  createParser,
  parseAsArrayOf,
  parseAsStringEnum,
} from "nuqs/server"

export const parseAsIsoDate = createParser({
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
  console.log("data", data)

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
    [K in `${TName}.lte` | `${TName}.gt`]: ParserBuilder<Date>
  }
