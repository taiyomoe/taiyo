import { type FormikConfig, type FormikValues } from "formik";

export type FormSubmit<T extends FormikValues> = FormikConfig<T>["onSubmit"];
