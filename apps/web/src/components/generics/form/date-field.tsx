"use client"

import type { DatePickerProps } from "@heroui/date-picker"
import type { DateValue } from "@heroui/react"
import { fromDate, getLocalTimeZone } from "@internationalized/date"
import { Controller } from "react-hook-form"
import { DatePicker } from "~/components/generics/date-picker"

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
        value={
          value
            ? (fromDate(value, getLocalTimeZone()) as unknown as DateValue)
            : null
        }
        onChange={(v) => onChange(v?.toDate(getLocalTimeZone()))}
        granularity="day"
        {...rest}
        {...field}
      />
    )}
  />
)
