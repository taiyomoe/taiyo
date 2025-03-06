"use client"

import { tv } from "@heroui/react"
import { Select, SelectItem, type SelectProps } from "@heroui/select"
import type { ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { SelectUtils } from "~/lib/utils/select.utils"

type Props = {
  name: string
  items: Record<string, unknown>
  renderOption?: (item: unknown) => ReactNode
  allowEmpty?: boolean
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
  allowEmpty,
  labelPlacement = "outside",
  classNames,
  ...rest
}: Props) => {
  const {
    register,
    formState: { errors, defaultValues },
  } = useFormContext()
  const errorMessage = errors[name]?.message?.toString()
  const itemsArray = [
    allowEmpty ? { label: "Selecionar", value: "" } : null,
    ...SelectUtils.enumToItems(items),
  ].filter(Boolean)
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
      renderValue={(item) =>
        item.at(0)?.data?.value === "" ? "" : item.at(0)?.rendered
      }
      {...register(name)}
      {...rest}
    >
      {(item) => (
        <SelectItem key={item.value} textValue={item.label}>
          {item.value === "" || !renderOption
            ? item.label
            : renderOption(item.value)}
        </SelectItem>
      )}
    </Select>
  )
}
