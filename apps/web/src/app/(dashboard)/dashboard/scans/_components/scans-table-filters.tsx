import { omit } from "radash"
import { useMemo } from "react"
import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useScansListStore } from "~/stores/use-scans-list-store"
import { rqbQueryTransformer } from "~/utils/rqb-query-transformer"

const fields: Field[] = [
  { name: "name", label: "Nome" },
  { name: "description", datatype: "nullable-text", label: "Descrição" },
  { name: "website", datatype: "nullable-text", label: "Website" },
  { name: "discord", datatype: "nullable-text", label: "Discord" },
  { name: "twitter", datatype: "nullable-text", label: "Twitter" },
  { name: "facebook", datatype: "nullable-text", label: "Facebook" },
  { name: "instagram", datatype: "nullable-text", label: "Instagram" },
  { name: "telegram", datatype: "nullable-text", label: "Telegram" },
  { name: "youtube", datatype: "nullable-text", label: "YouTube" },
  { name: "email", datatype: "nullable-text", label: "Email" },
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
      rqbQueryTransformer(omit(input, ["page", "perPage", "sort"]), [
        { field: "deletedAt", operator: "null", value: null },
      ]),
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
