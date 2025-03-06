import type { Field } from "react-querybuilder"

const NULLABLE_OPERATORS = [
  { name: "null", label: "nulo" },
  { name: "notNull", label: "não nulo" },
]

const BOOLEAN_OPERATORS = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
]

const NUMBER_OPERATORS = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: "<", label: "<" },
  { name: "<=", label: "<=" },
  { name: ">", label: ">" },
  { name: ">=", label: ">=" },
]

const DATE_OPERATORS = [
  { name: "<", label: "antes" },
  { name: ">", label: "depois" },
]

const TEXT_OPERATORS = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: "startsWith", label: "começa com" },
  { name: "endsWith", label: "termina com" },
  { name: "in", label: "em" },
  { name: "notIn", label: "não em" },
]

const RELATION_OPERATORS = [
  { name: "=", label: "=" },
  { name: "!=", label: "!=" },
  { name: "in", label: "em" },
  { name: "notIn", label: "não em" },
]

export const AVAILABLE_ENUMS = [
  "mediaType",
  "mediaStatus",
  "source",
  "demography",
  "countryOfOrigin",
  "language",
  "contentRating",
  "flag",

  "taskType",
  "taskStatus",
]

export const rqbOperators = (
  _: string,
  { fieldData }: { fieldData: Field },
) => {
  const datatype = String(fieldData.datatype)

  switch (true) {
    case datatype === "boolean":
      return BOOLEAN_OPERATORS
    case datatype === "number":
      return NUMBER_OPERATORS
    case datatype === "nullableNumber":
      return NUMBER_OPERATORS.concat(NULLABLE_OPERATORS)
    case datatype === "date":
      return DATE_OPERATORS
    case datatype === "nullableDate":
      return DATE_OPERATORS.concat(NULLABLE_OPERATORS)
    case datatype === "text":
      return TEXT_OPERATORS
    case datatype === "nullableText":
      return TEXT_OPERATORS.concat(NULLABLE_OPERATORS)
    case AVAILABLE_ENUMS.includes(datatype):
    case datatype === "user":
    case datatype === "media":
    case datatype === "scan":
      return RELATION_OPERATORS
  }

  return []
}
