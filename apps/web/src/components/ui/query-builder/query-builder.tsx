import { Divider } from "@nextui-org/divider"
import {
  QueryBuilder as BaseQueryBuilder,
  type FullCombinator,
  type FullField,
  type FullOperator,
  type QueryBuilderProps,
  type RuleGroupTypeAny,
} from "react-querybuilder"
import { rqbOperators } from "~/utils/rqb-operators"
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
      getOperators={rqbOperators}
      enableMountQueryChange={false}
      showCombinatorsBetweenRules
      resetOnOperatorChange
      {...props}
    />
  </div>
)
