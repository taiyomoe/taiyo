"use client";

import type { SelectProps } from "@nextui-org/select";
import { Select, SelectItem } from "@nextui-org/select";
import { useField } from "formik";
import { tv } from "tailwind-variants";

import { ObjectUtils } from "~/lib/utils/object.utils";

type Props<T> = {
  name: string;
  rightContent?: React.ReactNode;
  displayValidationError?: boolean;
  items: T;
} & Omit<SelectProps, "items" | "children">;

const select = tv({
  slots: {
    container: "flex items-end gap-6",
    label: "",
  },
  variants: {
    labelPlacement: {
      inside: {},
      outside: {
        container: "h-[66px]",
      },
      "outside-left": {
        label: "min-w-[100px] mr-6",
      },
    },
    shouldDisplayError: {
      true: {
        label: "text-danger",
        inputWrapper: "border-danger group-data-[hover=true]:border-danger-200",
      },
    },
  },
});

export const SelectFormField = <T extends Record<string, unknown>>({
  name,
  rightContent,
  items,
  className,
  classNames,
  displayValidationError,
  ...rest
}: Props<T>) => {
  const [field, { error, touched, initialTouched }] = useField<string>({
    name,
  });
  const itemsArray = ObjectUtils.arrayToSelectItems(
    ObjectUtils.enumToArray(items),
  );

  const shouldDisplayError = touched && !!error && !initialTouched;
  const shouldIgnoreErrorMessage = !!displayValidationError === false;
  const labelPlacement = rest.labelPlacement ?? "outside-left";
  const { container, label } = select({
    labelPlacement,
    shouldDisplayError:
      rest.variant === "bordered" ? shouldDisplayError : false,
  });

  return (
    <div className={container({ className })}>
      <Select
        {...field}
        {...rest}
        items={itemsArray}
        labelPlacement={labelPlacement}
        color={shouldDisplayError ? "danger" : "default"}
        selectionMode="single"
        defaultSelectedKeys={[field.value]}
        classNames={{
          label: label(),
          ...classNames,
        }}
        errorMessage={
          shouldDisplayError && !shouldIgnoreErrorMessage ? error : undefined
        }
      >
        {(item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        )}
      </Select>
      {rightContent}
    </div>
  );
};
