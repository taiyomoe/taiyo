import { Select, SelectItem, type Selection, tv } from "@nextui-org/react"
import type { ValueSelectorProps } from "react-querybuilder"
import type { SelectItem as SelectItemType } from "~/lib/types"

const queryBuilderValueSelector = tv({
  base: "w-fit",
  slots: {
    trigger: "",
  },
  variants: {
    type: {
      fields: {
        trigger: "w-[200px]",
      },
      operators: {
        trigger: "w-[100px]",
      },
      combinators: {
        trigger: "w-[100px]",
      },
    },
  },
  defaultVariants: {
    type: "fields",
  },
})

const getType = (input?: string) =>
  input && input in queryBuilderValueSelector.variants.type
    ? (input as keyof typeof queryBuilderValueSelector.variants.type)
    : undefined

export const QueryBuilderValueSelector = (props: ValueSelectorProps) => {
  const slots = queryBuilderValueSelector({ type: getType(props.testID) })

  const handleSelectionChange = (keys: Selection) => {
    props.handleOnChange(Array.from(keys).at(0))
  }

  return (
    <Select
      items={props.options as SelectItemType[]}
      selectionMode={props.multiple ? "multiple" : "single"}
      selectedKeys={new Set([props.value]) as Selection}
      onSelectionChange={handleSelectionChange}
      aria-label="Select value"
      classNames={{
        base: slots.base(),
        trigger: slots.trigger(),
      }}
    >
      {(item) => (
        <SelectItem key={item.value} value={item.value} textValue={item.label}>
          {item.label}
        </SelectItem>
      )}
    </Select>
  )
}
