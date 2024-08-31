import { Input } from "@nextui-org/input"
import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { ValueEditor, type ValueEditorProps } from "react-querybuilder"
import { MultiSelect } from "~/components/generics/multi-select"
import { EnumSelect } from "~/components/generics/selects/enum-select"
import { MediasAutocomplete } from "~/components/ui/autocompletes/medias/medias-autocomplete"
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
  const { fieldData, operator, handleOnChange } = props

  if (fieldData.datatype === "number") {
    return <Input className="min-w-[300px]" onValueChange={handleOnChange} />
  }

  if (fieldData.datatype === "media" && operator.includes("in")) {
    return (
      <MediasMultiAutocomplete
        classNames={{ container: () => "min-w-[300px]" }}
        onChange={(v) => handleOnChange(v.map((s) => s.value))}
      />
    )
  }

  if (fieldData.datatype === "media") {
    return (
      <MediasAutocomplete
        classNames={{ base: "min-w-[300px]" }}
        onSelectionChange={(v) => handleOnChange(v?.id ?? "")}
      />
    )
  }

  if (fieldData.datatype === "user" && operator.includes("in")) {
    return (
      <UsersMultiAutocomplete
        classNames={{ container: () => "min-w-[300px]" }}
        onChange={(v) => handleOnChange(v.map((s) => s.value))}
      />
    )
  }

  if (fieldData.datatype === "user") {
    return (
      <UsersAutocomplete
        classNames={{ base: "min-w-[300px]" }}
        onSelectionChange={(v) => handleOnChange(v?.id ?? "")}
      />
    )
  }

  if (fieldData.datatype === "scan") {
    return (
      <ScansMultiAutocomplete
        classNames={{ container: () => "min-w-[300px]" }}
        onChange={(v) => handleOnChange(v.map((s) => s.value))}
      />
    )
  }

  if (fieldData.datatype === "enum" && operator.includes("in")) {
    return (
      <MultiSelect
        options={SelectUtils.enumToItems(getEnum(fieldData.name))}
        onChange={(v) => handleOnChange(v.map((v) => v.value))}
      />
    )
  }

  if (fieldData.datatype === "enum") {
    return (
      <EnumSelect
        items={getEnum(fieldData.name)}
        onSelectionChange={(v) => handleOnChange(SelectUtils.getSelectedKey(v))}
      />
    )
  }

  return <ValueEditor {...props} />
}
