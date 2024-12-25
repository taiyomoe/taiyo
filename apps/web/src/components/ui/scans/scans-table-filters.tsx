import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useScansListStore } from "~/stores/scansList.store"

const fields: Field[] = [
  { name: "name", label: "Nome" },
  { name: "description", label: "Descrição" },
  { name: "website", label: "Website" },
  { name: "discord", label: "Discord" },
  { name: "twitter", label: "Twitter" },
  { name: "facebook", label: "Facebook" },
  { name: "instagram", label: "Instagram" },
  { name: "telegram", label: "Telegram" },
  { name: "youtube", label: "YouTube" },
  { name: "email", label: "Email" },
  { name: "createdAt", datatype: "date", label: "Data de criação" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "deletedAt", datatype: "nullable-date", label: "Data de remoção" },
  { name: "creatorId", datatype: "user", label: "Criador" },
  { name: "deleterId", datatype: "nullable-user", label: "Deletado por" },
]

export const ScansTableFilters = () => {
  const { setFilter } = useScansListStore()

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
