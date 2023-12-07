"use client";

import { useCallback } from "react";
import { Switch } from "@nextui-org/switch";
import type { SwitchProps } from "@nextui-org/switch";
import { useField } from "formik";

import { Label } from "../Label";
import type { LabelProps } from "../Label";

type Props = {
  name: string;
  shouldBeUnique?: boolean;
  onChange?: (value: boolean) => void;
} & Partial<Omit<SwitchProps, "onChange">> &
  LabelProps;

export const SwitchFormField = ({
  name,
  label,
  labelPlacement = "outside",
  className,
  onChange,
  ...rest
}: Props) => {
  // eslint-disable-next-line no-empty-pattern
  const [{ value, ...field }, {}, { setValue }] = useField<boolean>({
    name,
  });

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
        onChange={handleChange}
        className="h-[40px]"
        classNames={{
          wrapper: "mr-0",
        }}
      />
    </Label>
  );
};
