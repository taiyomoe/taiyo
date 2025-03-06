import { Input } from "@heroui/input"
import type { DateValue } from "@heroui/react"
import { Switch } from "@heroui/switch"
import { getLocalTimeZone, parseDate } from "@internationalized/date"
import {
  ContentRating,
  Flag,
  Languages,
  MediaCountryOfOrigin,
  MediaDemography,
  MediaSource,
  MediaStatus,
  MediaType,
  TaskStatus,
  TaskType,
} from "@taiyomoe/db"
import { useRef } from "react"
import type { Field, ValueEditorProps } from "react-querybuilder"
import { DatePicker } from "~/components/generics/date-picker"
import { MultiSelect } from "~/components/generics/multi-select"
import { EnumSelect } from "~/components/generics/selects/enum-select"
import { MediasAutocomplete } from "~/components/ui/autocompletes/medias/medias-autocomplete"
import { UsersAutocomplete } from "~/components/ui/autocompletes/users/users-autocomplete"
import { MediasMultiAutocomplete } from "~/components/ui/multi-autocompletes/medias-multi-autocomplete"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"
import { UsersMultiAutocomplete } from "~/components/ui/multi-autocompletes/users-multi-autocomplete"
import { SelectUtils } from "~/lib/utils/select.utils"
import { AVAILABLE_ENUMS } from "~/utils/rqb-operators"

const getEnum = (datatype: string) => {
  switch (datatype) {
    case "mediaType":
      return MediaType
    case "mediaStatus":
      return MediaStatus
    case "source":
      return MediaSource
    case "demography":
      return MediaDemography
    case "countryOfOrigin":
      return MediaCountryOfOrigin

    case "taskType":
      return TaskType
    case "taskStatus":
      return TaskStatus

    case "language":
      return Languages
    case "contentRating":
      return ContentRating
    case "flag":
      return Flag

    default:
      return {}
  }
}

export const QueryBuilderValueEditor = (props: ValueEditorProps) => {
  const { field, operator, handleOnChange } = props
  const fieldData = props.fieldData as Field
  const datatype = String(fieldData.datatype)
  const previousValue = useRef(props.value)

  if (previousValue.current !== props.value && !props.value) {
    previousValue.current = null
  }

  if (["null", "notNull"].includes(props.operator)) {
    return null
  }

  switch (true) {
    case datatype === "boolean":
      return <Switch onValueChange={handleOnChange} />
    case datatype === "number":
    case datatype === "nullableNumber":
      return (
        <Input
          className="min-w-[300px]"
          value={previousValue.current ?? ""}
          onValueChange={(v) => {
            handleOnChange(v)
            previousValue.current = v
          }}
          type="number"
        />
      )
    case datatype === "date":
    case datatype === "nullableDate":
      return (
        <DatePicker
          className="min-w-[300px]"
          value={
            props.value
              ? (parseDate(props.value) as unknown as DateValue)
              : null
          }
          onChange={(v) => handleOnChange(v?.toDate(getLocalTimeZone()))}
          granularity="day"
          aria-label="Date picker"
        />
      )
    case datatype === "media" && operator.includes("in"):
      return (
        <MediasMultiAutocomplete
          classNames={{ container: () => "min-w-[300px]" }}
          value={previousValue.current}
          onChange={(v) => {
            handleOnChange(v.map((s) => s.value))
            previousValue.current = v
          }}
        />
      )
    case datatype === "media":
      return (
        <MediasAutocomplete
          classNames={{ base: "min-w-[300px]" }}
          selectedKey={previousValue.current}
          onSelectionChange={(v) => {
            handleOnChange(v?.id ?? "")
            previousValue.current = v?.id ?? ""
          }}
        />
      )
    case datatype === "user" && operator.includes("in"):
      return (
        <UsersMultiAutocomplete
          classNames={{ container: () => "min-w-[300px]" }}
          value={previousValue.current}
          onChange={(v) => {
            handleOnChange(v.map((s) => s.value))
            previousValue.current = v
          }}
        />
      )
    case datatype === "user":
      return (
        <UsersAutocomplete
          classNames={{ base: "min-w-[300px]" }}
          selectedKey={previousValue.current}
          onSelectionChange={(v) => {
            handleOnChange(v?.id ?? "")
            previousValue.current = v?.id ?? ""
          }}
        />
      )
    case datatype === "scan":
      return (
        <ScansMultiAutocomplete
          classNames={{ container: () => "min-w-[300px]" }}
          value={previousValue.current}
          onChange={(v) => {
            handleOnChange(v.map((s) => s.value))
            previousValue.current = v
          }}
        />
      )
    case AVAILABLE_ENUMS.includes(datatype) &&
      ["in", "notIn"].includes(operator):
      return (
        <MultiSelect
          options={SelectUtils.enumToItems(getEnum(datatype))}
          value={previousValue.current}
          onChange={(v) => {
            handleOnChange(v.map((v) => v.value))
            previousValue.current = v
          }}
        />
      )
    case AVAILABLE_ENUMS.includes(datatype):
      return (
        <EnumSelect
          selectedKeys={props.value ? [props.value] : []}
          items={getEnum(field)}
          onSelectionChange={(v) =>
            handleOnChange(SelectUtils.getSelectedKey(v))
          }
        />
      )
    default:
      return (
        <Input
          className="min-w-[300px]"
          value={previousValue.current ?? ""}
          onValueChange={(v) => {
            handleOnChange(v)
            previousValue.current = v
          }}
        />
      )
  }
}
