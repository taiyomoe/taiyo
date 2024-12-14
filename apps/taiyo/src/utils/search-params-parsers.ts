import {
  type ParserBuilder,
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

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
    [`${name}.equals`]: parseAsString,
    [`${name}.not`]: parseAsString,
    [`${name}.lt`]: parseAsString,
    [`${name}.lte`]: parseAsString,
    [`${name}.gt`]: parseAsString,
    [`${name}.gte`]: parseAsString,
  }) as {
    [K in
      | `${TName}.equals`
      | `${TName}.not`
      | `${TName}.lte`
      | `${TName}.lt`
      | `${TName}.gt`
      | `${TName}.gte`]: ParserBuilder<string>
  }
