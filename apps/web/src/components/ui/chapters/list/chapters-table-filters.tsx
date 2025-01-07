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
  { name: "mediaId", datatype: "media", label: "Obras" },
  { name: "scanIds", datatype: "scan", label: "Scans" },
  { name: "createdAt", datatype: "date", label: "Data de upload" },
  { name: "updatedAt", datatype: "date", label: "Última atualização" },
  { name: "deletedAt", datatype: "nullableDate", label: "Deletado em" },
  { name: "uploaderId", datatype: "user", label: "Uploader" },
  { name: "deleterId", datatype: "nullable-user", label: "Deletado por" },
]

export const ChaptersTableFilters = () => {
  const { setFilter } = useChaptersListStore()

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
