"use client";

import { Input } from "@nextui-org/input";
import type { InputProps } from "@nextui-org/input";
import { useField } from "formik";
import { tv } from "tailwind-variants";

import { cn } from "~/utils/cn";

type Props = {
  name: string;
  rightContent?: React.ReactNode;
  displayValidationError?: boolean;
} & InputProps;

const input = tv({
  slots: {
    container: "flex items-end gap-6 w-full",
    label: "",
    mainWrapper: "w-full",
    inputWrapper: "p-3",
    base: "h-4",
  },
  variants: {
    labelPlacement: {
      inside: {},
      outside: {},
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

export const InputFormField = ({
  name,
  rightContent,
  className,
  classNames,
  displayValidationError,
  ...rest
}: Props) => {
  const [field, { error, touched, initialTouched }] = useField({ name });
  const shouldDisplayError = touched && !!error && !initialTouched;
  const shouldIgnoreErrorMessage = !!displayValidationError === false;
  const labelPlacement = rest.labelPlacement ?? "outside-left";
  const { container, label, mainWrapper, inputWrapper, base } = input({
    labelPlacement,
    shouldDisplayError:
      rest.variant === "bordered" ? shouldDisplayError : false,
  });

  return (
    <div className={cn(container(), className)}>
      <Input
        {...field}
        {...rest}
        value={(field.value as string) ?? ""}
        labelPlacement={labelPlacement}
        color={shouldDisplayError ? "danger" : "default"}
        classNames={{
          label: label(),
          mainWrapper: mainWrapper(),
          inputWrapper: inputWrapper(),
          input: base(),
          ...classNames,
        }}
        errorMessage={
          shouldDisplayError && !shouldIgnoreErrorMessage ? error : undefined
        }
      />
      {rightContent}
    </div>
  );
};
