import type { ButtonProps } from "@heroui/button"
import { Button } from "@heroui/button"
import { ChevronLeftIcon } from "lucide-react"

export const BackButton = (props: ButtonProps) => {
  return (
    <Button
      className="h-auto"
      startContent={<ChevronLeftIcon className="h-5 w-5 focus:outline-none" />}
      radius="sm"
      size="sm"
      isIconOnly
      {...props}
    />
  )
}
