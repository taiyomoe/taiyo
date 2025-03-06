import { Chip } from "@heroui/chip"
import type { ReactNode } from "react"
import { cn } from "~/lib/utils/cn"

type Props = {
  title: string
  description: ReactNode
  orientation?: "horizontal" | "vertical"
  warning?: ReactNode
  children: ReactNode
}

export const UserSettingsFormFieldBuilder = ({
  title,
  description,
  orientation = "horizontal",
  warning,
  children,
}: Props) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <p className="font-medium text-xl">{title}</p>
      {warning && (
        <Chip color="warning" variant="flat" size="sm">
          {warning}
        </Chip>
      )}
    </div>
    <div
      className={cn("flex flex-col gap-2", {
        "md:flex-row md:items-center md:justify-between md:gap-8":
          orientation === "horizontal",
      })}
    >
      <p
        className={cn("w-full text-foreground-400", {
          "md:w-2/3": orientation === "horizontal",
        })}
      >
        {description}
      </p>
      {children}
    </div>
  </div>
)
