"use client"

import type { TextAreaProps } from "@nextui-org/input"
import { useFormContext } from "react-hook-form"
import { TextArea } from "~/components/generics/textarea"

type Props = { name: string } & TextAreaProps

export const TextAreaField = ({ name, ...rest }: Props) => {
  const {
    register,
    formState: { errors, defaultValues },
  } = useFormContext()
  const errorMessage = errors[name]?.message?.toString()

  return (
    <TextArea
      color={errorMessage ? "danger" : "default"}
      defaultValue={defaultValues?.[name]}
      errorMessage={errorMessage}
      {...register(name)}
      {...rest}
    />
  )
}
