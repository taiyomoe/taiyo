"use client"

import type { InputProps } from "@nextui-org/input"
import { Controller } from "react-hook-form"
import { Input } from "~/components/generics/input"

type Props = { name: string } & InputProps

export const InputField = ({ name, labelPlacement, ...rest }: Props) => (
  <Controller
    name={name}
    render={({ field, formState: { errors, defaultValues } }) => {
      const errorMessage = errors[name]?.message?.toString()

      return (
        <Input
          color={errorMessage ? "danger" : "default"}
          defaultValue={defaultValues?.[name] ?? ""}
          labelPlacement={labelPlacement ?? "outside-left"}
          errorMessage={errorMessage}
          {...field}
          {...rest}
        />
      )
    }}
  />
)
