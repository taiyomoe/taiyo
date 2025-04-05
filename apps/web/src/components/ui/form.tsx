import { Slot } from "@radix-ui/react-slot"
import { type NestedKeyOf, useTranslations } from "next-intl"
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  createContext,
  forwardRef,
  useContext,
  useId,
} from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  type FormProviderProps,
  type SubmitHandler,
  useFormContext,
} from "react-hook-form"
import { cn } from "~/utils/cn"
import type { ZodMessages } from "~/utils/zod-messages"
import { Label, type LabelProps } from "./label"

type FormProps<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues,
> = FormProviderProps<TFieldValues, unknown, TTransformedValues> & {
  className?: string
  onSubmit: SubmitHandler<TTransformedValues>
}

export const Form = <
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues,
>({
  className,
  onSubmit,
  children,
  ...methods
}: FormProps<TFieldValues, TTransformedValues>) => {
  return (
    <FormProvider {...methods}>
      <form
        className={cn("flex flex-col gap-4", className)}
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  )
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

export const FormItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-1", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

export const FormLabel = ({ className, ...props }: LabelProps) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      className={cn(error && "text-error", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}
FormLabel.displayName = "FormLabel"

export const FormControl = forwardRef<
  ComponentRef<typeof Slot>,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

export const FormMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const t = useTranslations()
  const { name, error, formMessageId } = useFormField()
  const fieldKey = name as NestedKeyOf<IntlMessages["global"]>
  const errorKey = error?.message as ZodMessages | null

  const fieldName = t.has(`global.${fieldKey}`)
    ? t(`global.${fieldKey}`).toLowerCase()
    : name
  const body =
    errorKey && t.has(errorKey) ? t(errorKey, { name: fieldName }) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("font-medium text-[0.8rem] text-error", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"
