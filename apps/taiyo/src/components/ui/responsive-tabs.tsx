import { type SlotsToClasses, type VariantProps, tv } from "@nextui-org/react"
import { motion } from "framer-motion"
import { type ReactNode, useState } from "react"
import { Button } from "react-aria-components"

const responsiveTabs = tv({
  base: "scrollbar-none flex flex-row gap-4 overflow-x-auto md:min-w-fit md:flex-col",
  slots: {
    button:
      "relative flex items-center gap-2 px-3 py-1.5 outline-none transition-background",
    bubble: "absolute",
    text: "z-10 font-medium text-medium",
  },
  variants: {
    variant: {
      solid: {
        button: "rounded-medium",
        bubble: "inset-0 rounded-medium",
      },
    },
    color: {
      primary: {
        button: "text-white hover:bg-default/60",
        bubble: "bg-primary",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    color: "primary",
  },
})

type Props = {
  items: { id: string; label: string; startContent?: ReactNode }[]
  onChange: (key: string) => void
  className?: string
  classNames?: SlotsToClasses<keyof (typeof responsiveTabs)["slots"]>
} & VariantProps<typeof responsiveTabs>

export const ResponsiveTabs = (props: Props) => {
  const { items, onChange, className, classNames, ...rest } = props
  const [selectedTab, setSelectedTab] = useState(items[0]!.id)
  const slots = responsiveTabs({ ...rest })

  const handlePress = (id: string) => {
    setSelectedTab(id)
    onChange(id)
  }

  return (
    <div className={slots.base({ className })}>
      {items.map((item) => (
        <Button
          key={item.id}
          className={slots.button({ className: classNames?.button })}
          style={{ WebkitTapHighlightColor: "transparent" }}
          onPress={() => handlePress(item.id)}
        >
          <div className="z-10">{item.startContent}</div>
          {selectedTab === item.id && (
            <motion.span
              layoutId="bubble"
              className={slots.bubble({ className: classNames?.bubble })}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <p className={slots.text({ className: classNames?.text })}>
            {item.label}
          </p>
        </Button>
      ))}
    </div>
  )
}
