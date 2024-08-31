import { type Selection, tv } from "@nextui-org/react"
import { Select, SelectItem } from "@nextui-org/select"
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
        trigger: "w-[140px]",
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
  const { testID, options, multiple, value, handleOnChange } = props
  const slots = queryBuilderValueSelector({ type: getType(testID) })

  const handleSelectionChange = (keys: Selection) => {
    handleOnChange(Array.from(keys).at(0))
  }

  return (
    <Select
      items={options as SelectItemType[]}
      selectionMode={multiple ? "multiple" : "single"}
      selectedKeys={new Set([value]) as Selection}
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
