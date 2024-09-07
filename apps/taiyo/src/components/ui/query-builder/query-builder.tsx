import {
  QueryBuilder as BaseQueryBuilder,
  type Field,
  type FullCombinator,
  type FullField,
  type FullOperator,
  type QueryBuilderProps,
  type RuleGroupTypeAny,
  defaultOperators,
} from "react-querybuilder"
import { QueryBuilderActionButton } from "./query-builder-action-button"
import { QueryBuilderValueEditor } from "./query-builder-value-editor"
import { QueryBuilderValueSelector } from "./query-builder-value-selector"

export const QueryBuilder = <
  RG extends RuleGroupTypeAny,
  F extends FullField,
  O extends FullOperator,
  C extends FullCombinator,
>(
  props: Omit<
    QueryBuilderProps<RG, F, O, C>,
    | "controlClassnames"
    | "controlElements"
    | "translations"
    | "getOperators"
    | "enableMountQueryChange"
    | "showCombinatorsBetweenRules"
    | "resetOnOperatorChange"
  >,
) => {
  return (
    // @ts-expect-error - Typings error. This works fine
    <BaseQueryBuilder
      controlClassnames={{
        ruleGroup: "space-y-2 [&:only-child]:col-span-2",
        header: "flex gap-2",
        body: "grid grid-cols-[min-content_auto] items-start gap-2 overflow-x-auto overflow-y-clip scrollbar-thin pb-2",
        rule: "flex gap-2 [&:only-child]:col-span-2",
      }}
      controlElements={{
        valueSelector: QueryBuilderValueSelector,
        valueEditor: QueryBuilderValueEditor,
        actionElement: QueryBuilderActionButton,
      }}
      translations={{
        addRule: { label: "Nova regra" },
        addGroup: { label: "Novo grupo" },
      }}
      getOperators={getOperators}
      enableMountQueryChange={false}
      showCombinatorsBetweenRules
      resetOnOperatorChange
      {...props}
    />
  )
}

const getOperators = (_: string, { fieldData }: { fieldData: Field }) => {
  const isNullable = String(fieldData.datatype).includes("nullable-")
  const datatype = String(fieldData.datatype).replace("nullable-", "")
  const NULLABLE_OPERATORS = isNullable
    ? [
        { name: "null", label: "nulo" },
        { name: "notNull", label: "não nulo" },
      ]
    : []

  switch (datatype) {
    case "boolean":
      return [
        { name: "=", label: "=" },
        { name: "!=", label: "!=" },
      ]
    case "number":
      return [
        { name: "=", label: "=" },
        { name: "!=", label: "!=" },
        { name: "<", label: "<" },
        { name: "<=", label: "<=" },
        { name: ">", label: ">" },
        { name: ">=", label: ">=" },
        ...NULLABLE_OPERATORS,
      ]
    case "enum":
    case "user":
    case "media":
    case "scan":
      return [
        { name: "=", label: "=" },
        { name: "!=", label: "!=" },
        { name: "in", label: "em" },
        { name: "notIn", label: "não em" },
        ...NULLABLE_OPERATORS,
      ]
    case "date":
      return [
        { name: "=", label: "=" },
        { name: "!=", label: "!=" },
        { name: "<", label: "antes" },
        { name: "<=", label: "antes ou igual" },
        { name: ">", label: "depois" },
        { name: ">=", label: "depois ou igual" },
        ...NULLABLE_OPERATORS,
      ]
  }

  return defaultOperators
}
