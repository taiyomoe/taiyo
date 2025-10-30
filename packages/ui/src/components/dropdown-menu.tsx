import { Menu as MenuPrimitive } from "@base-ui-components/react/menu"
import { ScrollArea } from "@base-ui-components/react/scroll-area"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export const DropdownMenu = (
  props: ComponentProps<typeof MenuPrimitive.Root>,
) => <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />

export const DropdownMenuPortal = (
  props: ComponentProps<typeof MenuPrimitive.Portal>,
) => <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />

export const DropdownMenuTrigger = (
  props: ComponentProps<typeof MenuPrimitive.Trigger>,
) => <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />

export const DropdownMenuContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.Popup>) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
      data-slot="dropdown-menu-positioner"
      sideOffset={4}
    >
      <ScrollArea.Root
        render={
          <MenuPrimitive.Popup
            className={cn(
              "closed:fade-out-0 open:fade-in-0 closed:zoom-out-95 open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 h-64 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) closed:animate-out rounded border bg-muted p-1 pr-4 text-subtle shadow-md open:animate-in",
              className,
            )}
            data-slot="dropdown-menu-content"
            {...props}
          />
        }
      >
        <ScrollArea.Viewport className="h-full overscroll-contain">
          {children}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="m-1.5 flex w-1 justify-center rounded bg-subtle opacity-0 transition-opacity delay-300 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[hovering]:delay-0 data-[scrolling]:delay-0 data-[hovering]:duration-75 data-[scrolling]:duration-75">
          <ScrollArea.Thumb className="w-full rounded bg-emphasis" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
)

export const DropdownMenuGroup = (
  props: ComponentProps<typeof MenuPrimitive.Group>,
) => <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />

export const DropdownMenuItem = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Item>) => (
  <MenuPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm highlighted:not-disabled:bg-emphasis px-2 py-1.5 highlighted:not-disabled:text-primary text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle highlighted:[&_svg]:text-primary",
      className,
    )}
    data-slot="dropdown-menu-item"
    {...props}
  />
)

export const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof MenuPrimitive.CheckboxItem>) => (
  <MenuPrimitive.CheckboxItem
    data-slot="dropdown-menu-checkbox-item"
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm highlighted:not-disabled:bg-emphasis py-1.5 pr-2 pl-8 highlighted:not-disabled:text-primary text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle highlighted:[&_svg]:text-primary",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <MenuPrimitive.CheckboxItemIndicator>
        <CheckIcon className="size-4" />
      </MenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
)

export const DropdownMenuRadioGroup = (
  props: ComponentProps<typeof MenuPrimitive.RadioGroup>,
) => (
  <MenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
)

export const DropdownMenuRadioItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.RadioItem>) => (
  <MenuPrimitive.RadioItem
    data-slot="dropdown-menu-radio-item"
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm highlighted:not-disabled:bg-emphasis py-1.5 pr-2 pl-8 highlighted:not-disabled:text-primary text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle highlighted:[&_svg]:text-primary",
      className,
    )}
    {...props}
  >
    <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
      <MenuPrimitive.RadioItemIndicator>
        <CircleIcon className="size-2 fill-current" />
      </MenuPrimitive.RadioItemIndicator>
    </span>
    {children}
  </MenuPrimitive.RadioItem>
)

export const DropdownMenuLabel = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.GroupLabel>) => (
  <>
    <MenuPrimitive.GroupLabel
      className={cn(
        "select-none px-2 py-1.5 font-semibold text-subtle text-xs uppercase",
        className,
      )}
      data-slot="dropdown-menu-label"
      {...props}
    />
    <MenuPrimitive.Separator
      className={cn("mx-1 my-1 h-px border-b border-dashed", className)}
      data-slot="dropdown-menu-label-separator"
    />
  </>
)

export const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) => (
  <MenuPrimitive.Separator
    className={cn("-mx-1 my-1 h-px bg-subtle", className)}
    data-slot="dropdown-menu-separator"
    {...props}
  />
)

export const DropdownMenuShortcut = ({
  className,
  ...props
}: ComponentProps<"span">) => (
  <span
    className={cn(
      "ml-auto rounded-sm border bg-default px-1 py-0.5 text-subtle text-xs tracking-widest",
      className,
    )}
    data-slot="dropdown-menu-shortcut"
    {...props}
  />
)

export const DropdownMenuSub = (
  props: ComponentProps<typeof MenuPrimitive.SubmenuRoot>,
) => <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />

export const DropdownMenuSubTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.SubmenuTrigger>) => (
  <MenuPrimitive.SubmenuTrigger
    data-slot="dropdown-menu-sub-trigger"
    className={cn(
      "flex cursor-default select-none items-center rounded-sm highlighted:bg-emphasis px-2 py-1.5 highlighted:text-primary text-sm outline-hidden open:bg-emphasis open:text-primary open:[&>svg]:translate-x-0.5",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto size-4 transition-transform" />
  </MenuPrimitive.SubmenuTrigger>
)

export const DropdownMenuSubContent = ({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Popup>) => (
  <MenuPrimitive.Portal>
    <MenuPrimitive.Positioner
      data-slot="dropdown-menu-sub-positioner"
      sideOffset={4}
    >
      <MenuPrimitive.Popup
        data-slot="dropdown-menu-sub-content"
        className={cn(
          "closed:fade-out-0 open:fade-in-0 closed:zoom-out-95 open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--transform-origin) closed:animate-out overflow-hidden rounded border bg-muted p-1 text-subtle shadow-lg open:animate-in",
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Positioner>
  </MenuPrimitive.Portal>
)
