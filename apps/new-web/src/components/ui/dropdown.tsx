"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon } from "lucide-react"
import React, {
  type ComponentProps,
  type ComponentType,
  type HTMLAttributes,
  useRef,
} from "react"
import { type VariantProps, tv } from "tailwind-variants"
import type { AnimatedIconProps } from "~/components/icons/home-icon"
import { cn } from "~/utils/cn"

export const DropdownMenu = DropdownMenuPrimitive.Root

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

export const DropdownMenuGroup = DropdownMenuPrimitive.Group

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal

export const DropdownMenuSub = DropdownMenuPrimitive.Sub

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

export const DropdownMenuSubTrigger = ({
  className,
  inset,
  animatedIcon: AnimatedIcon,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
  animatedIcon?: ComponentType<AnimatedIconProps>
}) => {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "group/sub-trigger flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-subtle focus:text-primary data-[state=open]:bg-subtle data-[state=open]:text-primary [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {AnimatedIcon && <AnimatedIcon parentRef={ref} />}
      {children}
      <ChevronRightIcon className="ml-auto size-4! text-subtle transition-[color,rotate] group-hover/sub-trigger:text-primary group-data-[state=open]/sub-trigger:rotate-90 group-data-[state=open]/sub-trigger:text-primary" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

export const DropdownMenuSubContent = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) => (
  <DropdownMenuPrimitive.SubContent
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] space-y-2 overflow-hidden rounded border border-subtle bg-default p-3 shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in [&>div[role=group]]:space-y-2",
      className,
    )}
    {...props}
  />
)
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

export const DropdownMenuContent = ({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "dropdown-content-width-full z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded border border-subtle bg-default p-3 text-sm shadow-md",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 space-y-2 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
)
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const dropdownMenuItem = tv({
  base: "relative flex select-none items-center gap-2 rounded-sm p-2 text-sm outline-none transition-colors focus:cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  variants: {
    color: {
      default: "focus:bg-subtle focus:text-primary",
      error: "text-error-subtle focus:bg-error",
    },
    inset: { true: "pl-8" },
  },
  defaultVariants: { color: "default", inset: false },
})
export const DropdownMenuItem = ({
  className,
  color,
  inset,
  animatedIcon: AnimatedIcon,
  asChild,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> &
  VariantProps<typeof dropdownMenuItem> & {
    animatedIcon?: ComponentType<AnimatedIconProps>
  }) => {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={dropdownMenuItem({ className, color, inset })}
      asChild={asChild}
      {...props}
    >
      {/* This hack allows to use the component as a Link while still passing the animated icon down */}
      {asChild ? (
        React.cloneElement(
          React.Children.only(children as React.ReactElement),
          {
            children: (
              <>
                {AnimatedIcon && <AnimatedIcon parentRef={ref} />}
                {
                  (
                    React.Children.only(children as React.ReactElement)
                      .props as {
                      children: React.ReactNode
                    }
                  ).children
                }
              </>
            ),
            // biome-ignore lint/suspicious/noExplicitAny: this is fine
          } as any,
        )
      ) : (
        <>
          {AnimatedIcon && <AnimatedIcon parentRef={ref} />}
          {children}
        </>
      )}
    </DropdownMenuPrimitive.Item>
  )
}
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

export const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) => (
  <DropdownMenuPrimitive.CheckboxItem
    className={cn(
      "relative flex select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none transition-colors focus:cursor-pointer focus:bg-subtle focus:text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    {children}
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  </DropdownMenuPrimitive.CheckboxItem>
)
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

export const DropdownMenuRadioItem = ({
  className,
  animatedIcon: AnimatedIcon,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  animatedIcon?: ComponentType<AnimatedIconProps>
}) => {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none transition-colors focus:cursor-pointer focus:bg-subtle focus:text-primary data-[disabled]:pointer-events-none data-[state=checked]:text-primary data-[disabled]:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {AnimatedIcon && <AnimatedIcon parentRef={ref} />}
      {children}
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4!" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
    </DropdownMenuPrimitive.RadioItem>
  )
}
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

export const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) => (
  <DropdownMenuPrimitive.Label
    className={cn(
      "px-2 py-1.5 font-semibold text-primary text-sm",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
)
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

export const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator
    className={cn("-mx-3 my-3 h-px bg-muted", className)}
    {...props}
  />
)
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

export const DropdownMenuShortcut = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"
