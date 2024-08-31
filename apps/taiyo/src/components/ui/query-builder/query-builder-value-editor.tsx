import { Input, Select, SelectItem } from "@nextui-org/react"
import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { ValueEditor, type ValueEditorProps } from "react-querybuilder"
import { MultiSelect } from "~/components/generics/multi-select"
import { MediasAutocomplete } from "~/components/ui/autocompletes/medias-autocomplete"
import { UsersAutocomplete } from "~/components/ui/autocompletes/users/users-autocomplete"
import { MediasMultiAutocomplete } from "~/components/ui/multi-autocompletes/medias-multi-autocomplete"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"
import { UsersMultiAutocomplete } from "~/components/ui/multi-autocompletes/users-multi-autocomplete"
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
  if (props.fieldData.datatype === "number") {
    return (
      <Input className="min-w-[300px]" onValueChange={props.handleOnChange} />
    )
  }

  if (props.fieldData.datatype === "media" && props.operator.includes("in")) {
    return (
      <MediasMultiAutocomplete
        classNames={{ container: () => "min-w-[300px]" }}
        onChange={(values) => props.handleOnChange(values.map((s) => s.value))}
      />
    )
  }

  if (props.fieldData.datatype === "media") {
    return (
      <MediasAutocomplete
        classNames={{ base: "min-w-[300px]" }}
        onSelectionChange={(media) => props.handleOnChange(media.id)}
      />
    )
  }

  if (props.fieldData.datatype === "user" && props.operator.includes("in")) {
    return (
      <UsersMultiAutocomplete
        classNames={{ container: () => "min-w-[300px]" }}
        onChange={(values) => props.handleOnChange(values.map((s) => s.value))}
      />
    )
  }

  if (props.fieldData.datatype === "user") {
    return (
      <UsersAutocomplete
        classNames={{ base: "min-w-[300px]" }}
        onSelectionChange={(user) => props.handleOnChange(user?.id ?? "")}
      />
    )
  }

  if (props.fieldData.datatype === "scan") {
    return (
      <ScansMultiAutocomplete
        classNames={{ container: () => "min-w-[300px]" }}
        onChange={(values) => props.handleOnChange(values.map((s) => s.value))}
      />
    )
  }

  if (props.fieldData.datatype === "enum" && props.operator.includes("in")) {
    return (
      <MultiSelect
        options={SelectUtils.enumToItems(getEnum(props.fieldData.name))}
        onChange={(values) => props.handleOnChange(values.map((v) => v.value))}
      />
    )
  }

  if (props.fieldData.datatype === "enum") {
    return (
      <Select
        items={SelectUtils.enumToItems(getEnum(props.fieldData.name))}
        onSelectionChange={(keys) =>
          props.handleOnChange(SelectUtils.getSelectedKey(keys))
        }
        selectionMode="single"
        aria-label="Select value"
      >
        {({ label, value }) => (
          <SelectItem key={value} value={value} textValue={label}>
            {label}
          </SelectItem>
        )}
      </Select>
    )
  }

  return <ValueEditor {...props} />
}
