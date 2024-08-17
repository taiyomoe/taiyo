import { Button, type ButtonProps } from "@nextui-org/button"
import { AnimatePresence, motion } from "framer-motion"
import { EllipsisIcon } from "lucide-react"
import { forwardRef } from "react"

type Props = { isVisible: boolean } & Omit<ButtonProps, "ref" | "isIconOnly">

export const ScansTableMultipleActionsDropdownTrigger = forwardRef<
  HTMLButtonElement,
  Props
>(({ isVisible, ...props }, ref) => {
  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <Button ref={ref} variant="light" isIconOnly {...props}>
            <EllipsisIcon />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
