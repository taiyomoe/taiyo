import type { Field } from "react-querybuilder"
import { QueryBuilder } from "~/components/ui/query-builder/query-builder"
import { useChaptersList } from "~/hooks/useChaptersList"

const fields: Field[] = [
  { name: "number", datatype: "number", label: "Número" },
  { name: "volume", datatype: "number", label: "Volume" },
  { name: "language", datatype: "enum", label: "Idioma" },
  { name: "contentRating", datatype: "enum", label: "Classificação" },
  { name: "flag", datatype: "enum", label: "Flag" },
  { name: "uploaderId", datatype: "user", label: "Uploader" },
  { name: "mediaId", datatype: "media", label: "Obras" },
  { name: "scanIds", datatype: "scan", label: "Scans" },
  { name: "deleterId", datatype: "user", label: "Deletado por" },
  { name: "onlyDeleted", datatype: "boolean", label: "Somente deletados" },
]

export const ChaptersTableFilters = () => {
  const { handleQueryChange } = useChaptersList()

  return <QueryBuilder fields={fields} onQueryChange={handleQueryChange} />
}
