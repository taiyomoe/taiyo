"use client"

import { AnimatePresence, motion } from "framer-motion"

type Props = {
  active: boolean
  children: React.ReactNode
}

export const AnimatedPresence = ({ active, children }: Props) => (
  <AnimatePresence initial={false}>
    {active && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)
