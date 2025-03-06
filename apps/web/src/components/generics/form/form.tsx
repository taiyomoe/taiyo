import {
  type FieldValues,
  FormProvider,
  type FormProviderProps,
  type SubmitHandler,
} from "react-hook-form"
import { cn } from "~/lib/utils/cn"

type Props = { className?: string; children: React.ReactNode }
type CategoryProps = { title?: string; actions?: React.ReactNode } & Props

type FormProps<TFieldValues extends FieldValues> = {
  onSubmit: SubmitHandler<TFieldValues>
} & Props &
  FormProviderProps<TFieldValues>

const Component = <TFieldValues extends FieldValues>({
  className,
  onSubmit,
  children,
  ...methods
}: FormProps<TFieldValues>) => {
  return (
    <FormProvider {...methods}>
      <form
        className={cn("flex flex-col gap-10", className)}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

const Layout = ({ className, children }: Props) => (
  <div className={cn("flex flex-col gap-10", className)}>{children}</div>
)

const Category = ({ title, actions, className, children }: CategoryProps) => (
  <div className={cn("flex flex-col gap-4", className)}>
    <div className={cn("flex justify-between", { hidden: !title && !actions })}>
      {title && <h2 className="font-semibold text-2xl">{title}</h2>}
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
