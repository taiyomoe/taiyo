import { fromDate } from "@internationalized/date"
import { Input } from "@nextui-org/input"
import { Switch } from "@nextui-org/switch"
import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { ValueEditor, type ValueEditorProps } from "react-querybuilder"
import { DatePicker } from "~/components/generics/date-picker"
import { MultiSelect } from "~/components/generics/multi-select"
import { EnumSelect } from "~/components/generics/selects/enum-select"
import { MediasAutocomplete } from "~/components/ui/autocompletes/medias/medias-autocomplete"
import { UsersAutocomplete } from "~/components/ui/autocompletes/users/users-autocomplete"
import { MediasMultiAutocomplete } from "~/components/ui/multi-autocompletes/medias-multi-autocomplete"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"
import { UsersMultiAutocomplete } from "~/components/ui/multi-autocompletes/users-multi-autocomplete"
import { DateUtils } from "~/lib/utils/date.utils"
import { SelectUtils } from "~/lib/utils/select.utils"

const getEnum = (name: string) => {
  switch (name) {
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
  const { fieldData, operator, handleOnChange } = props

  if (["null", "notNull"].includes(props.operator)) {
    return null
  }

  switch (true) {
    case fieldData.datatype === "boolean":
      return <Switch onValueChange={handleOnChange} />
    case fieldData.datatype === "number":
    case fieldData.datatype === "nullable-number":
      return (
        <Input
          className="min-w-[300px]"
          onValueChange={handleOnChange}
          type="number"
        />
      )
    case fieldData.datatype === "date":
    case fieldData.datatype === "nullable-date":
      console.log("props value", props.value)

      return (
        <DatePicker
          className="min-w-[300px]"
          value={
            props.value
              ? fromDate(new Date(props.value * 1000), DateUtils.getTimezone())
              : null
          }
          onChange={(v) =>
            handleOnChange(DateUtils.getFromDateValue(v).toSeconds())
          }
          granularity="day"
          aria-label="Date picker"
        />
      )
    case fieldData.datatype === "media" && operator.includes("in"):
      return (
        <MediasMultiAutocomplete
          classNames={{ container: () => "min-w-[300px]" }}
          onChange={(v) => handleOnChange(v.map((s) => s.value))}
        />
      )
    case fieldData.datatype === "media":
      return (
        <MediasAutocomplete
          classNames={{ base: "min-w-[300px]" }}
          onSelectionChange={(v) => handleOnChange(v?.id ?? "")}
        />
      )
    case fieldData.datatype === "user" && operator.includes("in"):
      return (
        <UsersMultiAutocomplete
          classNames={{ container: () => "min-w-[300px]" }}
          onChange={(v) => handleOnChange(v.map((s) => s.value))}
        />
      )
    case fieldData.datatype === "user":
    case fieldData.datatype === "nullable-user":
      return (
        <UsersAutocomplete
          classNames={{ base: "min-w-[300px]" }}
          onSelectionChange={(v) => handleOnChange(v?.id ?? "")}
        />
      )
    case fieldData.datatype === "scan":
      return (
        <ScansMultiAutocomplete
          classNames={{ container: () => "min-w-[300px]" }}
          onChange={(v) => handleOnChange(v.map((s) => s.value))}
        />
      )
    case fieldData.datatype === "enum" && operator.includes("in"):
      return (
        <MultiSelect
          options={SelectUtils.enumToItems(getEnum(fieldData.name))}
          onChange={(v) => handleOnChange(v.map((v) => v.value))}
        />
      )
    case fieldData.datatype === "enum":
      return (
        <EnumSelect
          items={getEnum(fieldData.name)}
          onSelectionChange={(v) =>
            handleOnChange(SelectUtils.getSelectedKey(v))
          }
        />
      )
    default:
      return <ValueEditor {...props} />
  }
}
