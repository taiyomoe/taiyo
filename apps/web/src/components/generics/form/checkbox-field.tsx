import { Checkbox, type CheckboxProps } from "@nextui-org/checkbox"
import { omit } from "radash"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"

type Props = { name: string; label: string } & Omit<CheckboxProps, "onChange">

export const CheckboxField = ({
  name,
  label,
  className,
  onValueChange,
  isRequired,
  ...rest
}: Props) => {
  const { register, getValues, setValue } = useFormContext()
  const [isSelected, setIsSelected] = useState(() => getValues(name))

  const handleChange = useCallback(
    (newValue: boolean) => {
      setValue(name, newValue, { shouldValidate: true, shouldDirty: true })
      setIsSelected(newValue)
      onValueChange?.(newValue)
    },
    [setValue, onValueChange, name],
  )

  return (
    <Checkbox
      onValueChange={handleChange}
      isSelected={isSelected}
      {...omit(register(name), ["onChange", "onBlur", "ref"])}
      {...rest}
    >
      {label}
    </Checkbox>
  )
}
