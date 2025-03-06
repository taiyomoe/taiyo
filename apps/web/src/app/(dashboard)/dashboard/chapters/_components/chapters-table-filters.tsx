import { omit } from "radash"
import { useMemo } from "react"
import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useChaptersListStore } from "~/stores/use-chapters-list-store"
import { rqbQueryTransformer } from "~/utils/rqb-query-transformer"

const fields: Field[] = [
  { name: "number", datatype: "number", label: "Número" },
  { name: "volume", datatype: "nullableNumber", label: "Volume" },
  { name: "language", datatype: "language", label: "Idioma" },
  { name: "contentRating", datatype: "contentRating", label: "Classificação" },
  { name: "flag", datatype: "flag", label: "Flag" },
  // { name: "mediaId", datatype: "media", label: "Obras" },
  // { name: "scanIds", datatype: "scan", label: "Scans" },
  { name: "createdAt", datatype: "date", label: "Data de upload" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "deletedAt", datatype: "nullableDate", label: "Data de remoção" },
  // { name: "uploaderId", datatype: "user", label: "Uploader" },
  // { name: "deleterId", datatype: "user", label: "Deletado por" },
]

export const ChaptersTableFilters = () => {
  const { input, setFilter } = useChaptersListStore()
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
