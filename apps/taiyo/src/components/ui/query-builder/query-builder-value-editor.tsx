import { Input } from "@nextui-org/react"
import { ValueEditor, type ValueEditorProps } from "react-querybuilder"

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
    return <Input onValueChange={props.handleOnChange} />
  }

  console.log("value editor props", props)

  return <ValueEditor {...props} />
}
