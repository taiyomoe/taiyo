"use client"

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Button, type ButtonProps } from "react-aria-components"
import { cn } from "~/utils/cn"
import { useSidebar } from "./sidebar-context"

type Props = Omit<ButtonProps, "onPress">

export const SidebarToggleButton = ({ className, ...props }: Props) => {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Button
      className={cn(
        "group/sidebar-toggle rounded p-1 text-subtle transition duration-300 hover:cursor-pointer hover:text-default [&_svg]:size-4 [&_svg]:transition-transform",
        className,
      )}
      onPress={toggleSidebar}
      {...props}
    >
      {state === "expanded" && (
        <ArrowLeftIcon className="group-hover/sidebar-toggle:-translate-x-1" />
      )}
      {state === "collapsed" && (
        <ArrowRightIcon className="group-hover/sidebar-toggle:translate-x-1" />
      )}
    </Button>
  )
}
