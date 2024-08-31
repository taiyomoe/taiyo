import { Button } from "@nextui-org/button"
import { PlusIcon, Trash2Icon } from "lucide-react"
import type { ActionProps } from "react-querybuilder"

export const QueryBuilderActionButton = (props: ActionProps) => {
  const { testID, handleOnClick } = props
  const defaultProps = {
    onPress: () => handleOnClick(),
    color: "primary",
  } as const

  switch (testID) {
    case "add-rule":
    case "add-group":
      return (
        <Button
          className="w-[140px]"
          startContent={<PlusIcon size={20} />}
          variant="flat"
          {...defaultProps}
        >
          {testID === "add-rule" ? "Nova regra" : "Novo grupo"}
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

  throw new Error(`Unknown action: ${testID}`)
}
