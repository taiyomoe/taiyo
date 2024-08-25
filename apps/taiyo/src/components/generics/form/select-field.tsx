"use client"

import { tv } from "@nextui-org/react"
import { Select, SelectItem, type SelectProps } from "@nextui-org/select"
import type { ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { SelectUtils } from "~/lib/utils/select.utils"

type Props = {
  name: string
  items: Record<string, unknown>
  renderOption?: (item: unknown) => ReactNode
} & Omit<SelectProps, "items" | "children">

const select = tv({
  slots: {
    label: "z-0",
  },
  variants: {
    labelPlacement: {
      inside: {},
      outside: {},
      "outside-left": {
        label: "mr-6 min-w-[100px]",
      },
    },
  },
})

export const SelectField = ({
  name,
  items,
  renderOption,
  labelPlacement = "outside",
  classNames,
  ...rest
}: Props) => {
  const {
    register,
    formState: { errors, defaultValues },
  } = useFormContext()
  const errorMessage = errors[name]?.message?.toString()
  const itemsArray = SelectUtils.enumToItems(items)
  const slots = select({ labelPlacement })

  return (
    <Select
      color={errorMessage ? "danger" : "default"}
      defaultSelectedKeys={[defaultValues?.[name]!]}
      labelPlacement={labelPlacement}
      selectionMode="single"
      items={itemsArray}
      errorMessage={errorMessage}
      classNames={{
        label: slots.label(),
        ...classNames,
      }}
      {...register(name)}
      {...rest}
    >
      {(item) => (
        <SelectItem key={item.value} value={item.value} textValue={item.label}>
          {renderOption ? renderOption(item.value) : item.label}
        </SelectItem>
      )}
    </Select>
  )
}
