import type { DefaultRuleGroupType } from "react-querybuilder"
import { rqbOperatorTransformer } from "~/utils/rqb-operator-transformer"

export const rqbFilterTransformer = (input: DefaultRuleGroupType) => {
  const values: Record<string, Record<string, unknown>> = {}

  for (const rule of input.rules) {
    /**
     * 1. If the rule doesn't have an operator or value, it might be a group, so we skip it.
     * 2. If the rule has a value of "", it means the user just added the rule and is about to select the value.
     * 3. Step 2 is invalidated if the operator is "null" or "notNull"
     */
    if (
      !("operator" in rule) ||
      ("operator" in rule &&
        rule.value === "" &&
        !["null", "notNull"].includes(rule.operator))
    )
      continue

    const operator = rqbOperatorTransformer(rule.operator)

    if (!operator) continue

    values[rule.field] = {
      ...(values[rule.field] ?? {}),
      [operator]: rule.value || rule.operator,
    }
  }

  return values
}
