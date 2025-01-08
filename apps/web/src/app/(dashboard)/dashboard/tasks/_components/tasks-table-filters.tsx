import { pick } from "radash"
import { useMemo } from "react"
import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useTasksListStore } from "~/stores/use-tasks-list-store"
import { rqbQueryTransformer } from "~/utils/rqb-query-transformer"

const fields: Field[] = [
  { name: "type", datatype: "taskStatus", label: "Tipo" },
  { name: "status", datatype: "taskStatus", label: "Status" },
  { name: "createdAt", datatype: "date", label: "Data de criação" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
]

export const TasksTableFilters = () => {
  const { input, setFilter } = useTasksListStore()
  const defaultQuery = useMemo(
    () =>
      rqbQueryTransformer(
        pick(input, ["createdAt", "updatedAt", "status", "type"]),
      ),
    [input],
  )

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
