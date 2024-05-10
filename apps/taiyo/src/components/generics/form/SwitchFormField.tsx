"use client"

import { Switch } from "@nextui-org/switch"
import type { SwitchProps } from "@nextui-org/switch"
import { useField } from "formik"
import { useCallback } from "react"
import { Label } from "../label"
import type { LabelProps } from "../label"

type Props = {
  name: string
  shouldBeUnique?: boolean
  onChange?: (value: boolean) => void
} & Partial<Omit<SwitchProps, "onChange">> &
  LabelProps

export const SwitchFormField = ({
  name,
  label,
  labelPlacement = "outside",
  className,
  onChange,
  ...rest
}: Props) => {
  // biome-ignore lint/correctness/noEmptyPattern: we need to destructure the array
  const [{ value, ...field }, {}, { setValue }] = useField<boolean>({
    name,
  })

  const handleChange = useCallback(() => {
    void setValue(!value)

    if (onChange) {
      onChange(!value)
    }
  }, [onChange, setValue, value])

  return (
    <Label label={label} labelPlacement={labelPlacement} className={className}>
      <Switch
        {...field}
        {...rest}
        isSelected={value}
        onChange={handleChange}
        className="h-[40px]"
        classNames={{
          wrapper: "mr-0",
        }}
      />
    </Label>
  )
}
