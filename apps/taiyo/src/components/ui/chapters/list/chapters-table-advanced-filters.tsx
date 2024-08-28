import { useState } from "react"
import {
  type Field,
  QueryBuilder,
  type RuleGroupType,
  defaultOperators,
  formatQuery,
} from "react-querybuilder"
import { QueryBuilderActionButton } from "~/components/ui/query-builder/query-builder-action-button"
import { QueryBuilderValueEditor } from "~/components/ui/query-builder/query-builder-value-editor"
import { QueryBuilderValueSelector } from "~/components/ui/query-builder/query-builder-value-selector"

const getOperators = (_: string, { fieldData }: { fieldData: Field }) => {
  console.log("get operators", fieldData.datatype)

  switch (fieldData.datatype) {
    case "number":
      return [
        { name: "=", label: "=" },
        { name: "!=", label: "!=" },
        { name: "<", label: "<" },
        { name: "<=", label: "<=" },
        { name: ">", label: ">" },
        { name: ">=", label: ">=" },
      ]
    case "enum":
      return [{ name: "=", label: "=" }]
  }

  return defaultOperators
}

const fields: Field[] = [
  { name: "numbers", datatype: "number", label: "Números" },
  { name: "volumes", datatype: "number", label: "Volumes" },
  { name: "languages", datatype: "enum", label: "Idiomas" },
  { name: "contentRatings", datatype: "enum", label: "Classificação" },
  { name: "flags", datatype: "enum", label: "Flag" },
  { name: "uploaderIds", datatype: "user", label: "Uploader" },
  { name: "mediaIds", datatype: "media", label: "Obras" },
  { name: "scanIds", datatype: "scan", label: "Scans" },
  { name: "deleterIds", datatype: "user", label: "Deletado por" },
  { name: "includeDeleted", datatype: "boolean", label: "Incluir deletados" },
]

export const ChaptersTableAdvancedFilters = () => {
  const [query, setQuery] = useState<RuleGroupType>({
    combinator: "and",
    rules: [],
  })

  console.log(
    "formatted",
    formatQuery(query, { format: "jsonata", parseNumbers: true }),
  )

  return (
    <QueryBuilder
      controlClassnames={{
        ruleGroup: "flex flex-col gap-2 [&:only-child]:col-span-2",
        header: "flex gap-2",
        body: "grid grid-cols-[min-content_auto] items-start gap-2",
        rule: "flex gap-2 [&:only-child]:col-span-2",
      }}
      fields={fields}
      defaultQuery={{ combinator: "and", rules: [] }}
      getDefaultField="numbers"
      getDefaultOperator="="
      onQueryChange={setQuery}
      controlElements={{
        valueSelector: QueryBuilderValueSelector,
        valueEditor: QueryBuilderValueEditor,
        actionElement: QueryBuilderActionButton,
      }}
      getOperators={getOperators}
      showCombinatorsBetweenRules
    />
  )
}
