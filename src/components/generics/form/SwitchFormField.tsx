"use client";

import { useCallback, useMemo } from "react";
import { Switch } from "@nextui-org/switch";
import type { SwitchProps } from "@nextui-org/switch";
import { useField } from "formik";

import { Label } from "../Label";
import type { LabelProps } from "../Label";

type Props = {
  name: string;
  label: string;
  shouldBeUnique?: boolean;
  onChange?: (value: boolean) => void;
} & Partial<SwitchProps> &
  LabelProps;

export const SwitchFormField = ({
  name,
  label,
  labelPlacement = "outside",
  className,
  shouldBeUnique,
  onChange,
  ...rest
}: Props) => {
  // eslint-disable-next-line no-empty-pattern
  const [{ value, ...field }, {}, { setValue }] = useField<boolean>({
    name,
  });

  const shouldDisable = useMemo(() => {
    if (!shouldBeUnique) return false;

    return value;
  }, [shouldBeUnique, value]);

  const handleChange = useCallback(() => {
    void setValue(!value);

    if (onChange) {
      onChange(!value);
    }
  }, [onChange, setValue, value]);

  return (
    <Label label={label} labelPlacement={labelPlacement} className={className}>
      <Switch
        {...field}
        {...rest}
        isSelected={value}
        isDisabled={shouldDisable}
        onChange={handleChange}
        className="h-[40px]"
        classNames={{
          wrapper: "mr-0",
        }}
      />
    </Label>
  );
};
