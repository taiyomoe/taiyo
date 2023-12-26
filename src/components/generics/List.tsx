import { Divider } from "@nextui-org/divider"
import React from "react"

import { cn } from "~/lib/utils/cn"

type Props = {
  className?: string
  children: React.ReactNode
}

export const List = ({ className, children }: Props) => {
  const childrenWithDividers = React.Children.map(children, (child, index) => (
    <>
      {child}
      {index !== React.Children.count(children) - 1 && (
        <Divider className="my-2" />
      )}
    </>
  ))

  return (
    <div className={cn("flex flex-col", className)}>{childrenWithDividers}</div>
  )
}
