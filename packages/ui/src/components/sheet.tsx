import { Dialog as SheetPrimitive } from "@base-ui-components/react/dialog"
import { XIcon } from "lucide-react"
import { AnimatePresence, type HTMLMotionProps, motion } from "motion/react"
import type { ComponentProps } from "react"
import { cn } from "../utils/cn"

export type Side = "top" | "bottom" | "left" | "right"

export const Sheet = (props: ComponentProps<typeof SheetPrimitive.Root>) => (
  <SheetPrimitive.Root data-slot="sheet" {...props} />
)

export const SheetTrigger = (props: ComponentProps<typeof SheetPrimitive.Trigger>) => (
  <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
)

export const SheetClose = (props: ComponentProps<typeof SheetPrimitive.Close>) => (
  <SheetPrimitive.Close data-slot="sheet-close" {...props} />
)

export const SheetPortal = (props: ComponentProps<typeof SheetPrimitive.Portal>) => (
  <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
)

export const SheetOverlay = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Backdrop> & HTMLMotionProps<"div">) => (
  <SheetPrimitive.Backdrop
    data-slot="sheet-overlay"
    render={
      <motion.div
        className={cn("fixed inset-0 z-50 bg-black/10", className)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        {...props}
      />
    }
  />
)

export const SheetContent = ({
  className,
  children,
  side = "right",
  open,
  ...props
}: ComponentProps<typeof SheetPrimitive.Popup> &
  HTMLMotionProps<"div"> & {
    side?: "top" | "right" | "bottom" | "left"
    open: boolean
  }) => {
  const axis = side === "left" || side === "right" ? "x" : "y"
  const offscreen: Record<Side, { x?: string; y?: string; opacity: number }> = {
    right: { x: "100%", opacity: 0 },
    left: { x: "-100%", opacity: 0 },
    top: { y: "-100%", opacity: 0 },
    bottom: { y: "100%", opacity: 0 },
  }

  return (
    <AnimatePresence>
      {open && (
        <SheetPortal keepMounted>
          <SheetOverlay />
          <SheetPrimitive.Popup
            render={
              <motion.div
                className={cn(
                  "fixed z-50 m-1.5 flex flex-col gap-4 rounded border bg-muted shadow-lg",
                  side === "right" && "inset-y-0 right-0 h-auto w-3/4 sm:max-w-sm",
                  side === "left" && "inset-y-0 left-0 h-auto w-3/4 sm:max-w-sm",
                  side === "top" && "inset-x-0 top-0 h-auto",
                  side === "bottom" && "inset-x-0 bottom-0 h-auto",
                  className,
                )}
                key="sheet-content"
                data-slot="sheet-content"
                data-side={side}
                initial={offscreen[side]}
                animate={{ [axis]: 0, opacity: 1 }}
                exit={offscreen[side]}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                {...props}
              />
            }
          >
            {children}
            <SheetPrimitive.Close className="absolute top-4 right-4 rounded-xs text-primary opacity-70 ring-offset-primary transition-[color,opacity] hover:opacity-100 disabled:pointer-events-none">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          </SheetPrimitive.Popup>
        </SheetPortal>
      )}
    </AnimatePresence>
  )
}

export const SheetHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />
)

export const SheetFooter = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="sheet-footer"
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
)

export const SheetTitle = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title
    data-slot="sheet-title"
    className={cn("font-semibold text-primary", className)}
    {...props}
  />
)

export const SheetDescription = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    data-slot="sheet-description"
    className={cn("text-sm text-subtle", className)}
    {...props}
  />
)
