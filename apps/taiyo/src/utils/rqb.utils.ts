import type {
  DefaultRuleGroupType,
  RuleGroupType,
  RuleType,
} from "react-querybuilder"
import { formatQuery as baseFormatQuery } from "react-querybuilder/formatQuery"

const ruleFilterSingle = (input: RuleGroupType | RuleType) => {
  if ("rules" in input) {
    return input.rules.length ? input.rules.every(ruleFilterSingle) : false
  }

  if (["null", "notNull"].includes(input.operator)) {
    return true
  }

  return Array.isArray(input.value)
    ? input.value.length !== 0
    : input.value !== ""
}

const formatQuery = (input: RuleGroupType) => {
  const filteredRules = input.rules.filter(ruleFilterSingle)

  if (filteredRules.length === 0) {
    return null
  }

  return baseFormatQuery(
    { ...input, rules: filteredRules },
    { format: "jsonata", parseNumbers: true },
  )
}

const computeNewQuery = (oldQuery: string, newQuery: DefaultRuleGroupType) => {
  const formatted = formatQuery(newQuery)

  if ((formatted === null && oldQuery === "") || oldQuery === formatted) {
    return null
  }

  return formatted ?? ""
}

export const RQBUtils = {
  formatQuery,
  computeNewQuery,
}
