import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useMediasListStore } from "~/stores/mediasList.store"

const fields: Field[] = [
  { name: "synposis", label: "Sinopse" },
  { name: "type", datatype: "enum", label: "Tipo" },
  { name: "status", datatype: "enum", label: "Status" },
  { name: "source", datatype: "enum", label: "Fonte" },
  { name: "demography", datatype: "enum", label: "Demografia" },
  { name: "countryOfOrigin", datatype: "enum", label: "Origem" },
  { name: "genres", datatype: "enum", label: "Gêneros" },
  { name: "tags", datatype: "enum", label: "Tags" },
  { name: "flag", datatype: "enum", label: "Flag" },
  { name: "createdAt", datatype: "date", label: "Data de criação" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "deletedAt", datatype: "nullable-date", label: "Data de remoção" },
  { name: "creatorId", datatype: "user", label: "Criador" },
  { name: "deleterId", datatype: "nullable-user", label: "Deletado por" },
]

export const MediasTableFilters = () => {
  const { setFilter } = useMediasListStore()

  const handleQueryChange = useDebounceCallback(
    (newQuery) => setFilter(newQuery),
    300,
  )

  return (
    <QueryBuilder
      fields={fields}
      onQueryChange={handleQueryChange}
      defaultQuery={{
        rules: [{ field: "deletedAt", operator: "null", value: null }],
      }}
    />
  )
}
