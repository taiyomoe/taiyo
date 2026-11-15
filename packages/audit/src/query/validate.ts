import type { AuditLogField } from "./fields"
import type { KqlNode, KqlSyntaxError, KqlValue } from "./parse"

const isWildcard = (value: KqlValue) => !value.quoted && value.text.includes("*")
const issue = (message: string, value: KqlValue): KqlSyntaxError => ({
  message,
  start: value.start,
  end: value.end,
})

export const normalizeEnumValue = (field: AuditLogField, text: string) =>
  field.name === "method" ? text.toUpperCase() : text.toLowerCase()

const checkValue = (
  field: AuditLogField,
  value: KqlValue,
  comparison: "match" | "range",
): KqlSyntaxError | null => {
  if (field.type === "enum" && field.values !== undefined && !isWildcard(value)) {
    return field.values.includes(normalizeEnumValue(field, value.text))
      ? null
      : issue(
          `"${value.text}" is not a valid ${field.name}. Use one of: ${field.values.join(", ")}.`,
          value,
        )
  }

  if (field.type === "number") {
    return /^-?\d+$/.test(value.text)
      ? null
      : issue(`"${field.name}" takes a whole number, not "${value.text}".`, value)
  }

  if (field.type === "date") {
    if (comparison === "match") {
      return issue(`Compare "${field.name}" with <, <=, > or >=.`, value)
    }

    return Number.isNaN(new Date(value.text).getTime())
      ? issue(
          `"${value.text}" is not a date. Use a format like 2026-10-17 or 2026-10-17T14:30.`,
          value,
        )
      : null
  }

  return null
}

export const validateKql = (node: KqlNode): KqlSyntaxError | null => {
  switch (node.type) {
    case "or":

    case "and": {
      for (const child of node.children) {
        const found = validateKql(child)

        if (found !== null) {
          return found
        }
      }

      return null
    }

    case "not": {
      return validateKql(node.child)
    }

    case "match": {
      return checkValue(node.field, node.value, "match")
    }

    case "range": {
      return checkValue(node.field, node.value, "range")
    }

    case "exists":

    case "text":

    default: {
      return null
    }
  }
}
