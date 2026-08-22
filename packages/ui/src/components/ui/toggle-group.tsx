"use client"

import type { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import type { VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Toggle as ToggleComponent, type toggleVariants } from "@/components/ui/toggle"

export const ToggleGroupContext: React.Context<VariantProps<typeof toggleVariants>> =
  React.createContext<VariantProps<typeof toggleVariants>>({
    size: "default",
    variant: "default",
  })

export function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props & VariantProps<typeof toggleVariants>): React.ReactElement {
  return (
    <ToggleGroupPrimitive
      className={cn(
        "flex w-fit *:focus-visible:z-10 *:dark:[[data-slot=separator]:has(+[data-slot=toggle]:hover)]:before:bg-input/64 *:dark:[[data-slot=separator]:has(+[data-slot=toggle][data-pressed])]:before:bg-input *:dark:[[data-slot=toggle]:hover+[data-slot=separator]]:before:bg-input/64 *:dark:[[data-slot=toggle][data-pressed]+[data-slot=separator]]:before:bg-input",
        orientation === "horizontal"
          ? "*:pointer-coarse:after:min-w-auto"
          : "*:pointer-coarse:after:min-h-auto",
        variant === "default"
          ? "gap-0.5"
          : orientation === "horizontal"
            ? "*:not-first:rounded-l-none *:not-first:border-l-0 *:not-last:rounded-r-none *:not-last:border-r-0 *:not-first:before:rounded-l-none *:not-last:before:rounded-r-none *:not-first:not-data-[slot=separator]:before:left-[-0.5px] *:not-last:not-data-[slot=separator]:before:right-[-0.5px]"
            : "flex-col *:not-first:rounded-t-none *:not-first:border-t-0 *:not-last:rounded-b-none *:not-last:border-b-0 *:not-first:before:rounded-t-none *:not-last:before:rounded-b-none *:not-first:not-data-[slot=separator]:before:top-[-0.5px] *:not-last:not-data-[slot=separator]:before:bottom-[-0.5px] *:data-[slot=toggle]:not-last:before:hidden *:first:dark:before:block *:last:dark:before:hidden",
        className,
      )}
      data-size={size}
      data-slot="toggle-group"
      data-variant={variant}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ size, variant }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>): React.ReactElement {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant = context.variant || variant
  const resolvedSize = context.size || size

  return (
    <ToggleComponent
      className={className}
      data-size={resolvedSize}
      data-variant={resolvedVariant}
      size={resolvedSize}
      variant={resolvedVariant}
      {...props}
    >
      {children}
    </ToggleComponent>
  )
}

export function ToggleGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: {
  className?: string
} & React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <Separator
      className={cn(
        "pointer-events-none relative bg-input before:absolute before:inset-0 dark:before:bg-input/32",
        className,
      )}
      orientation={orientation}
      {...props}
    />
  )
}

export { ToggleGroupPrimitive }
