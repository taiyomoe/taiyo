import { Switch, type SwitchProps } from "@nextui-org/switch"
import { omit } from "lodash-es"
import { useCallback, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Label, type LabelProps } from "~/components/generics/Label"

type Props = { name: string } & Omit<SwitchProps, "onChange"> & LabelProps

export const SwitchField = ({
  name,
  label,
  labelPlacement,
  className,
  ...rest
}: Props) => {
  const { register, getValues, setValue } = useFormContext()
  const [isSelected, setIsSelected] = useState(() => getValues(name))

  const handleChange = useCallback(
    (newValue: boolean) => {
      setValue(name, newValue, { shouldValidate: true })
      setIsSelected(newValue)
    },
    [setValue, name],
  )

  return (
    <Label label={label} labelPlacement={labelPlacement} className={className}>
      <Switch
        onValueChange={handleChange}
        isSelected={isSelected}
        classNames={{
          base: "h-[40px]",
          wrapper: "mr-0",
        }}
        {...omit(register(name), ["onChange", "onBlur", "ref"])}
        {...rest}
      />
    </Label>
  )
}
