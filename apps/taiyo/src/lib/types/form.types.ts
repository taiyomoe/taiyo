import type { FormikConfig, FormikValues } from "formik"

export type FormSubmit<T extends FormikValues> = FormikConfig<T>["onSubmit"]

export type SelectItem = { label: string; value: string }

export type RangeValue = string
export type RangeItem = { label: number; value: RangeValue }
