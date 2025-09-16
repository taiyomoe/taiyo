import { Select as BaseSelect } from "@base-ui-components/react/select"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export const Select = (props: ComponentProps<typeof BaseSelect.Root>) => (
  <BaseSelect.Root data-slot="select" {...props} />
)

export const SelectValue = (props: ComponentProps<typeof BaseSelect.Value>) => (
  <BaseSelect.Value data-slot="select-value" {...props} />
)

export const SelectTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseSelect.Trigger>) => (
  <BaseSelect.Trigger
    className={cn(
      "group flex h-9 w-full min-w-64 pressed:scale-[0.98] select-none justify-between gap-4 rounded border border-subtle pressed:border-emphasis bg-muted px-3 py-2 text-primary text-sm outline-none transition-[background,scale,border] duration-300 open:border-emphasis hover:cursor-pointer hover:border-emphasis focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-default data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    data-slot="select-trigger"
    {...props}
  >
    {children}
    <BaseSelect.Icon
      className="flex items-center justify-center"
      data-slot="select-icon"
    >
      <ChevronDownIcon className="size-4 text-subtle transition-transform duration-300 group-open:rotate-180" />
    </BaseSelect.Icon>
  </BaseSelect.Trigger>
)

export const SelectContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof BaseSelect.Popup>) => (
  <BaseSelect.Portal data-slot="select-portal">
    <BaseSelect.Positioner
      className="z-10 select-none outline-none"
      data-slot="select-positioner"
      alignItemWithTrigger={false}
      sideOffset={4}
    >
      <BaseSelect.ScrollUpArrow
        className="top-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-muted text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]"
        data-slot="select-scroll-up-arrow"
      />
      <BaseSelect.Popup
        className={cn(
          "group max-h-[var(--available-height)] origin-[var(--transform-origin)] overflow-y-auto rounded border border-subtle bg-muted bg-clip-padding py-1 text-subtle shadow-gray-200 shadow-lg outline-none transition-[transform,scale,opacity] data-[side=none]:data-[starting-style]:scale-100 data-[side=none]:data-[starting-style]:opacity-100 data-[side=none]:data-[ending-style]:transition-none data-[side=none]:data-[starting-style]:transition-none data-[ending-style]:scale-90 data-[starting-style]:scale-90 data-[side=none]:scroll-py-5 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:shadow-none",
          className,
        )}
        data-slot="select-popup"
        {...props}
      >
        {children}
      </BaseSelect.Popup>
      <BaseSelect.ScrollDownArrow
        className="bottom-0 z-[1] flex h-4 w-full cursor-default items-center justify-center rounded-md bg-muted text-center text-xs before:absolute before:top-[-100%] before:left-0 before:h-full before:w-full before:content-[''] data-[direction=down]:bottom-0 data-[direction=down]:before:bottom-[-100%]"
        data-slot="select-scroll-down-arrow"
      />
    </BaseSelect.Positioner>
  </BaseSelect.Portal>
)

export const SelectItem = ({
  children,
  className,
  ...props
}: ComponentProps<typeof BaseSelect.Item>) => (
  <BaseSelect.Item
    className={cn(
      "highlighted:relative highlighted:z-0 grid min-w-[var(--anchor-width)] cursor-default select-none grid-cols-[1fr_0.75rem] items-center gap-4 px-3 py-2 selected:font-medium highlighted:text-primary selected:text-primary text-sm outline-none highlighted:before:absolute highlighted:before:inset-x-1 highlighted:before:inset-y-0 highlighted:before:z-[-1] highlighted:before:rounded-sm highlighted:before:bg-emphasis hover:cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-50 group-data-[side=none]:min-w-[calc(var(--anchor-width)+1rem)] group-data-[side=none]:scroll-my-1 group-data-[side=none]:pr-12 group-data-[side=none]:text-base group-data-[side=none]:leading-4",
      className,
    )}
    data-slot="select-item"
    {...props}
  >
    <BaseSelect.ItemText className="col-start-1" data-slot="select-item-text">
      {children}
    </BaseSelect.ItemText>
    <BaseSelect.ItemIndicator
      className="col-start-2"
      data-slot="select-item-indicator"
    >
      <CheckIcon className="size-3" />
    </BaseSelect.ItemIndicator>
  </BaseSelect.Item>
)
