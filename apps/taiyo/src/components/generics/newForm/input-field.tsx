"use client"

import type { InputProps } from "@nextui-org/input"
import { useFormContext } from "react-hook-form"
import { Input } from "~/components/generics/input"

type Props = { name: string } & InputProps

export const InputField = ({ name, ...rest }: Props) => {
  const {
    register,
    formState: { errors, defaultValues },
  } = useFormContext()
  const errorMessage = errors[name]?.message?.toString()

  return (
    <Input
      color={errorMessage ? "danger" : "default"}
      defaultValue={defaultValues?.[name] ?? ""}
      errorMessage={errorMessage}
      {...register(name)}
      {...rest}
    />
  )
}
