"use client";

import { Textarea } from "@nextui-org/react";
import type { TextAreaProps } from "@nextui-org/react";
import { useField } from "formik";
import { tv } from "tailwind-variants";

import { cn } from "~/lib/utils/cn";

type Props = {
  name: string;
  rightContent?: React.ReactNode;
  displayValidationError?: boolean;
} & TextAreaProps;

const textArea = tv({
  slots: {
    container: "flex items-end gap-6 w-full",
    label: "",
    mainWrapper: "w-full",
    inputWrapper: "p-3",
    base: "h-[76px] p-0",
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

export const TextAreaFormField = ({
  name,
  rightContent,
  className,
  classNames,
  labelPlacement = "outside",
  displayValidationError,
  ...rest
}: Props) => {
  const [field, { error, touched, initialTouched }] = useField({ name });
  const shouldDisplayError = touched && !!error && !initialTouched;
  const shouldIgnoreErrorMessage = !!displayValidationError === false;
  const { container, label, mainWrapper, inputWrapper, base } = textArea();

  return (
    <div className={cn(container(), className)}>
      <Textarea
        {...field}
        {...rest}
        labelPlacement={labelPlacement ?? "outside-left"}
        color={shouldDisplayError ? "danger" : "default"}
        classNames={{
          label: cn(
            label({
              shouldDisplayError:
                rest.variant === "bordered" ? shouldDisplayError : false,
            }),
          ),
          mainWrapper: mainWrapper(),
          inputWrapper: cn(
            inputWrapper({
              shouldDisplayError:
                rest.variant === "bordered" ? shouldDisplayError : false,
            }),
          ),
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
