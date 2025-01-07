import { omit } from "radash"
import { useMemo } from "react"
import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useMediasListStore } from "~/stores/use-medias-list-store"
import { rqbQueryTransformer } from "~/utils/rqb-query-transformer"

const fields: Field[] = [
  { name: "contentRating", datatype: "contentRating", label: "Classificação" },
  // one shot
  { name: "type", datatype: "mediaType", label: "Tipo" },
  { name: "status", datatype: "mediaStatus", label: "Status" },
  { name: "source", datatype: "source", label: "Fonte" },
  { name: "demography", datatype: "demography", label: "Demografia" },
  {
    name: "countryOfOrigin",
    datatype: "countryOfOrigin",
    label: "Origem",
  },
  // genres
  // tags
  { name: "flag", datatype: "flag", label: "Flag" },
  { name: "createdAt", datatype: "date", label: "Data de criação" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "deletedAt", datatype: "nullableDate", label: "Data de remoção" },
  { name: "startDate", datatype: "nullableDate", label: "Data de início" },
  { name: "endDate", datatype: "nullableDate", label: "Data de término" },
  { name: "creatorId", datatype: "user", label: "Criador" },
  { name: "deleterId", datatype: "user", label: "Deletado por" },
]

export const MediasTableFilters = () => {
  const { input, setFilter } = useMediasListStore()
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

  console.log("defaultQuery", defaultQuery)

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
