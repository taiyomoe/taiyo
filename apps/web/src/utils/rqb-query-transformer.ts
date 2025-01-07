import { crush } from "radash"
import type { RuleGroupArray } from "react-querybuilder"
import { rqbOperatorTransformer } from "~/utils/rqb-operator-transformer"

export const rqbQueryTransformer = (
  input: Record<string, unknown>,
  defaultRules: RuleGroupArray = [],
) => {
  const rules: RuleGroupArray = []
  const crushed = crush(input)

  for (const [key, value] of Object.entries(crushed)) {
    if (!value) continue

    const [field, rawOperator] = key.split(".")

    if (!field || !rawOperator) continue

    if (value === "null" || value === "notNull") {
      rules.push({ field, operator: value, value: null })

      continue
    }

    const operator = rqbOperatorTransformer(rawOperator)

    if (!operator) continue

    rules.push({ field, operator, value })
  }

  /**
   * Merge the arrays, with unique rules based on the field property.
   *
   * This will not work with groups, but that's not a problem
   * because currently we don't support them in the filters.
   */
  const mergedRulesMap = new Map()

  for (const rule of defaultRules) {
    if ("field" in rule) {
      mergedRulesMap.set(rule.field, rule)
    }
  }

  for (const rule of rules) {
    if ("field" in rule) {
      mergedRulesMap.set(rule.field, rule)
    }
  }

  const mergedRules = Array.from(mergedRulesMap.values()) as RuleGroupArray

  return { combinator: "and", rules: mergedRules }
}
