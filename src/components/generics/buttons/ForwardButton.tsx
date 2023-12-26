import type { ButtonProps } from "@nextui-org/button"
import { Button } from "@nextui-org/button"
import { ChevronRightIcon } from "lucide-react"

export const ForwardButton = (props: ButtonProps) => {
  return (
    <Button
      className="h-auto"
      startContent={<ChevronRightIcon className="h-5 w-5 focus:outline-none" />}
      radius="sm"
      size="sm"
      isIconOnly
      {...props}
    />
  )
}
