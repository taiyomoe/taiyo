"use client";

import { Formik, Form as FormikForm } from "formik";
import type { FormikConfig, FormikValues } from "formik";

import { cn } from "~/utils/cn";

type Props<T> = {
  className?: string;
  children: React.ReactNode;
} & FormikConfig<T>;

export const Form = <T extends FormikValues>({
  className,
  children,
  ...rest
}: Props<T>) => {
  return (
    <Formik<T> {...rest}>
      <FormikForm noValidate className={cn("flex flex-col gap-4", className)}>
        {children}
      </FormikForm>
    </Formik>
  );
};
