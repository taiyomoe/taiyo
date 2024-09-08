import type { Field } from "react-querybuilder"
import { useDebounceCallback } from "usehooks-ts"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useChaptersListStore } from "~/stores/chaptersList.store"

const fields: Field[] = [
  { name: "number", datatype: "number", label: "Número" },
  { name: "volume", datatype: "nullable-number", label: "Volume" },
  { name: "language", datatype: "enum", label: "Idioma" },
  { name: "contentRating", datatype: "enum", label: "Classificação" },
  { name: "flag", datatype: "enum", label: "Flag" },
  { name: "uploaderId", datatype: "user", label: "Uploader" },
  { name: "mediaId", datatype: "media", label: "Obras" },
  { name: "scanIds", datatype: "scan", label: "Scans" },
  { name: "deleterId", datatype: "nullable-user", label: "Deletado por" },
  { name: "deletedAt", datatype: "nullable-date", label: "Deletado em" },
]

export const ChaptersTableFilters = () => {
  const { setQuery } = useChaptersListStore()

  const handleQueryChange = useDebounceCallback(
    (newQuery) => setQuery(newQuery),
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
