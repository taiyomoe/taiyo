import { crush, pick } from "radash"
import { useMemo } from "react"
import type { Field, RuleGroupArray, RuleGroupType } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useTasksListStore } from "~/stores/use-tasks-list-store"
import { rqbOperatorTransformer } from "~/utils/rqb-operator-transformer"

const fields: Field[] = [
  { name: "createdAt", datatype: "date", label: "Data de criação" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "status", datatype: "enum", label: "Status" },
  { name: "type", datatype: "enum", label: "Tipo" },
]

export const TasksTableFilters = () => {
  const { input, setFilter } = useTasksListStore()
  const defaultQuery = useMemo(() => {
    const rules: RuleGroupArray = []
    const crushed = crush(
      pick(input, ["createdAt", "updatedAt", "status", "type"]),
    )

    for (const [key, value] of Object.entries(crushed)) {
      if (!value) continue

      const [field, rawOperator] = key.split(".")

      if (!field || !rawOperator) continue

      const operator = rqbOperatorTransformer(rawOperator)

      if (!operator) continue

      rules.push({ field, operator, value })
    }

    return { combinator: "and", rules } as RuleGroupType
  }, [input])

  const handleQueryChange = useDebounceCallback(
    (newQuery) => setFilter(newQuery),
    300,
  )

  return (
    <QueryBuilder
      fields={fields}
      onQueryChange={handleQueryChange}
      defaultQuery={defaultQuery}
      disableGroups
      disableCombinators
    />
  )
}
