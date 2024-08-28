import { Button } from "@nextui-org/button"
import { PlusIcon, Trash2Icon } from "lucide-react"
import type { ActionProps } from "react-querybuilder"

export const QueryBuilderActionButton = (props: ActionProps) => {
  const defaultProps = {
    onPress: () => props.handleOnClick(),
    color: "primary",
  } as const

  switch (props.testID) {
    case "add-rule":
    case "add-group":
      return (
        <Button
          startContent={<PlusIcon size={20} />}
          variant="flat"
          {...defaultProps}
        >
          {props.testID === "add-rule" ? "Nova regra" : "Novo grupo"}
        </Button>
      )

    case "remove-rule":
    case "remove-group":
      return (
        <Button
          startContent={<Trash2Icon size={20} />}
          variant="light"
          isIconOnly
          {...defaultProps}
        />
      )
  }

  console.log("props", props)

  return <div>azerty</div>
}
