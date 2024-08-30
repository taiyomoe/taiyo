import { Input, Select, SelectItem } from "@nextui-org/react"
import { ContentRating, Flag, Languages } from "@taiyomoe/db"
import { ValueEditor, type ValueEditorProps } from "react-querybuilder"
import { MultiSelect } from "~/components/generics/multi-select"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"
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

  if (props.fieldData.datatype === "enum" && !props.operator.includes("in")) {
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
