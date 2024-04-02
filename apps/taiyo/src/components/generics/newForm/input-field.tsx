"use client"

import type { InputProps } from "@nextui-org/input"
import { Controller } from "react-hook-form"
import { Input } from "~/components/generics/input"

type Props = { name: string } & InputProps

export const InputField = ({ name, labelPlacement, ...rest }: Props) => (
  <Controller
    name={name}
    render={({
      field: { value, ...field },
      fieldState: { invalid, error },
    }) => (
      <Input
        labelPlacement={labelPlacement ?? "outside-left"}
        errorMessage={error?.message}
        isInvalid={invalid}
        value={value ?? ""}
        {...field}
        {...rest}
      />
    )}
  />
)
