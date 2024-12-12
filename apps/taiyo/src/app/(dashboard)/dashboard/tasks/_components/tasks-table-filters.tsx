import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useTasksListStore } from "~/stores/use-tasks-list-store"

const fields: Field[] = [
  { name: "createdAt", datatype: "date", label: "Data de criação" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "status", datatype: "enum", label: "Status" },
  { name: "type", datatype: "enum", label: "Tipo" },
]

export const TasksTableFilters = () => {
  const { setFilter } = useTasksListStore()

  const handleQueryChange = useDebounceCallback(
    (newQuery) => setFilter(newQuery),
    300,
  )

  return <QueryBuilder fields={fields} onQueryChange={handleQueryChange} />
}
