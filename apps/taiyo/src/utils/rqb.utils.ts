import type {
  DefaultRuleGroupType,
  RuleGroupType,
  RuleType,
} from "react-querybuilder"
import { formatQuery as baseFormatQuery } from "react-querybuilder/formatQuery"

const ruleFilterSingle = (r: RuleGroupType | RuleType) => {
  if ("rules" in r) {
    return r.rules.length ? r.rules.every(ruleFilterSingle) : false
  }

  return Array.isArray(r.value) ? r.value.length !== 0 : r.value !== ""
}

const formatQuery = (newQuery: RuleGroupType) => {
  const filteredRules = newQuery.rules.filter(ruleFilterSingle)

  if (filteredRules.length === 0) {
    return null
  }

  return baseFormatQuery(
    { ...newQuery, rules: filteredRules },
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
