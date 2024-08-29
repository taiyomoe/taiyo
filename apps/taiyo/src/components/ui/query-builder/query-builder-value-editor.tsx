import { Input } from "@nextui-org/react"
import { ValueEditor, type ValueEditorProps } from "react-querybuilder"
import { ScansMultiAutocomplete } from "~/components/ui/multi-autocompletes/scans-multi-autocomplete"

export const QueryBuilderValueEditor = (props: ValueEditorProps) => {
  // if (props.fieldData.datatype === "date") {
  //   return (
  //     <div>
  //       <DatePicker
  //         dateFormat={dateFormat}
  //         selected={
  //           !props.value ? null : parse(props.value, dateFormat, new Date())
  //         }
  //         onChange={(d: Date) =>
  //           props.handleOnChange(d ? format(d, dateFormat) : null)
  //         }
  //       />
  //     </div>
  //   )
  // }
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

  console.log("value editor props", props)

  return <ValueEditor {...props} />
}
