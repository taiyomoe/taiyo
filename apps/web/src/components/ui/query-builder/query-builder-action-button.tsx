import { Button } from "@heroui/button"
import { PlusIcon, Trash2Icon } from "lucide-react"
import type { ActionProps } from "react-querybuilder"
import { cn } from "~/lib/utils/cn"

export const QueryBuilderActionButton = (props: ActionProps) => {
  const { className, testID, handleOnClick } = props
  const defaultProps = {
    onPress: () => handleOnClick(),
    color: "primary",
  } as const

  switch (testID) {
    case "add-rule":
    case "add-group":
      return (
        <Button
          className={cn("w-[140px] text-primary", className)}
          startContent={<PlusIcon size={20} />}
          variant="flat"
          {...defaultProps}
        >
          {props.label}
        </Button>
      )

    case "remove-rule":
    case "remove-group":
      return (
        <Button
          className={className}
          startContent={<Trash2Icon size={20} />}
          variant="light"
          isIconOnly
          {...defaultProps}
        />
      )
  }

  throw new Error(`Unknown action: ${testID}`)
}
