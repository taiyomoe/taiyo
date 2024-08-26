"use client"

import type { DatePickerProps } from "@nextui-org/date-picker"

import { fromDate } from "@internationalized/date"
import { Controller } from "react-hook-form"
import { DatePicker } from "~/components/generics/date-picker"

const DEFAULT_TIMEZONE = "America/Sao_Paulo"

type Props = { name: string } & DatePickerProps

export const DateField = ({ name, labelPlacement, ...rest }: Props) => (
  <Controller
    name={name}
    render={({
      field: { value, onChange, ...field },
      fieldState: { invalid, error },
    }) => (
      <DatePicker
        labelPlacement={labelPlacement ?? "outside-left"}
        errorMessage={error?.message}
        isInvalid={invalid}
        value={value ? fromDate(value, DEFAULT_TIMEZONE) : undefined}
        onChange={(newDate) => onChange(newDate.toDate(DEFAULT_TIMEZONE))}
        granularity="day"
        {...field}
        {...rest}
      />
    )}
  />
)
