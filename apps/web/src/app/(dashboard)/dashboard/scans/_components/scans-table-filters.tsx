import { pick } from "radash"
import { useMemo } from "react"
import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useScansListStore } from "~/stores/use-scans-list-store"
import { rqbQueryTransformer } from "~/utils/rqb-query-transformer"

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
  const { input, setFilter } = useScansListStore()
  const defaultQuery = useMemo(
    () =>
      rqbQueryTransformer(
        pick(input, ["createdAt", "updatedAt", "deletedAt"]),
        [{ field: "deletedAt", operator: "null", value: null }],
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
