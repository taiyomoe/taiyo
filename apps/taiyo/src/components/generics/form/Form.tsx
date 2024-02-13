import { Form as FormikForm, Formik } from "formik"
import type { FormikConfig, FormikProps, FormikValues } from "formik"

import { cn } from "~/lib/utils/cn"

type FormProps<T extends FormikValues> = {
  className?: string
  children: React.ReactNode | ((props: FormikProps<T>) => React.ReactNode)
}

type Props = {
  className?: string
  children: React.ReactNode
}

type CategoryProps = {
  title?: string
  actions?: React.ReactNode
} & Props

const Component = <T extends FormikValues>({
  className,
  children,
  ...rest
}: FormProps<T> & FormikConfig<T>) => {
  return (
    <Formik<T> {...rest}>
      {(options) => (
        <FormikForm
          noValidate
          className={cn("flex flex-col gap-10", className)}
        >
          {typeof children === "function" ? children(options) : children}
        </FormikForm>
      )}
    </Formik>
  )
}

const Layout = ({ className, children }: Props) => (
  <div className={cn("flex flex-col gap-10", className)}>{children}</div>
)

const Category = ({ title, actions, className, children }: CategoryProps) => (
  <div className={cn("flex flex-col gap-4", className)}>
    <div className={cn("flex justify-between", { hidden: !title && !actions })}>
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      <div className="flex items-center gap-2">{actions}</div>
    </div>
    <div className="flex flex-col gap-6">{children}</div>
  </div>
)

const Actions = ({ className, children }: Props) => (
  <div className={cn("flex justify-end gap-6", className)}>{children}</div>
)

const Row = ({ className, children }: Props) => (
  <div className={cn("flex flex-col gap-6 md:flex-row", className)}>
    {children}
  </div>
)

const Col = ({ className, children }: Props) => (
  <div className={cn("flex w-full flex-col gap-6", className)}>{children}</div>
)

/**
 * These components allow me to not mess up the different
 * gaps between the different form components.
 */
export const Form = {
  Component,
  Layout,
  Category,
  Actions,
  Row,
  Col,
}
