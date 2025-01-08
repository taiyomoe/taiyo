import type { InputProps } from "@nextui-org/input"
import { tv } from "@nextui-org/react"
import { cn } from "~/lib/utils/cn"

type Props = {
  label?: string
  labelPlacement?: InputProps["labelPlacement"]
  className?: string
  id?: string
  isRequired?: boolean
  children: React.ReactNode
}

export type LabelProps = Omit<Props, "children">

const labelVariants = tv({
  slots: {
    container: "flex min-w-fit",
    base: "!duration-200 !ease-out z-0 block origin-top-left pb-1.5 text-foreground text-small transition-all will-change-auto motion-reduce:transition-none",
  },
  variants: {
    hide: {
      true: {
        base: "hidden",
      },
    },
    labelPlacement: {
      inside: {},
      outside: {
        container: "flex-col",
      },
      "outside-left": {
        container: "items-center",
        base: "mr-6 min-w-[100px]",
      },
    },
    isRequired: {
      true: "after:ml-0.5 after:text-danger after:content-['*']",
    },
  },
})

export const Label = ({
  label,
  labelPlacement = "outside",
  className,
  id,
  isRequired,
  children,
}: Props) => {
  const { container, base } = labelVariants({
    hide: label === undefined,
    labelPlacement,
    isRequired,
  })

  return (
    <div className={cn(container(), className)}>
      <label className={base()} htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}
