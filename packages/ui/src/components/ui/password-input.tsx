import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip"
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, useState } from "react"

const styles = stylex.create({
  icon: {
    height: "1rem",
    width: "1rem",
  },
})

export type PasswordInputProps = Omit<ComponentProps<typeof InputGroupInput>, "type"> & {
  containerClassName?: string
  startIcon?: React.ReactNode
}

export const PasswordInput = ({ startIcon, containerClassName, ...props }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const iconProps = stylex.props(styles.icon)

  return (
    <InputGroup className={containerClassName}>
      <InputGroupInput type={showPassword ? "text" : "password"} {...props} />
      {startIcon && <InputGroupAddon align="inline-start">{startIcon}</InputGroupAddon>}
      <InputGroupAddon align="inline-end">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                size="icon-xs"
                variant="ghost"
              />
            }
          >
            {showPassword ? (
              <HugeiconsIcon
                icon={ViewOffSlashIcon}
                className={iconProps.className}
                style={iconProps.style}
              />
            ) : (
              <HugeiconsIcon
                icon={ViewIcon}
                className={iconProps.className}
                style={iconProps.style}
              />
            )}
          </TooltipTrigger>
          <TooltipPopup>{showPassword ? "Hide password" : "Show password"}</TooltipPopup>
        </Tooltip>
      </InputGroupAddon>
    </InputGroup>
  )
}
