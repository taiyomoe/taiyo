import { Divider } from "@nextui-org/divider"
import { Input } from "@nextui-org/input"
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
>({
  filter,
  disableGroups,
  disableCombinators,
  ...props
}: Omit<
  QueryBuilderProps<RG, F, O, C>,
  | "controlClassnames"
  | "controlElements"
  | "translations"
  | "getOperators"
  | "enableMountQueryChange"
  | "showCombinatorsBetweenRules"
  | "resetOnOperatorChange"
> & {
  filter?: string
  disableGroups?: boolean
  disableCombinators?: boolean
}) => (
  <div
    className="group flex flex-col"
    data-disable-groups={disableGroups ?? "false"}
    data-disable-combinators={disableCombinators ?? "false"}
  >
    <h5 className="text-default-400 text-sm">Filtros</h5>
    <Divider className="mb-2 bg-default-300" />
    {/* @ts-expect-error - Typings error. This works fine */}
    <BaseQueryBuilder
      controlClassnames={{
        ruleGroup: "space-y-2 [&:only-child]:col-span-2",
        header: "flex gap-2",
        body: "grid group-data-[disable-groups=false]:grid-cols-[min-content_auto] items-start gap-2 overflow-x-auto overflow-y-clip scrollbar-thin pb-2",
        rule: "flex gap-2 [&:only-child]:col-span-2",
        betweenRules: "group-data-[disable-combinators=true]:hidden",
        addGroup: "group-data-[disable-groups=true]:hidden",
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
    <Input
      className="mt-2"
      classNames={{ inputWrapper: "data-[hover=true]:bg-default-100" }}
      value={filter || "(1 = 1)"}
      isReadOnly
    />
  </div>
)

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
