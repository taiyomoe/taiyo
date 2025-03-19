"use client"

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"
import { Button, type ButtonProps } from "react-aria-components"
import { cn } from "~/utils/cn"
import { useSidebar } from "./sidebar-context"

type Props = Omit<ButtonProps, "onPress">

export const SidebarToggleButton = ({ className, ...props }: Props) => {
  const { state, toggle } = useSidebar()

  return (
    <Button
      className={cn(
        "group/sidebar-toggle hidden rounded p-1 text-subtle transition duration-300 hover:cursor-pointer hover:text-default md:block [&_svg]:size-4 [&_svg]:transition-transform",
        className,
      )}
      onPress={toggle}
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
