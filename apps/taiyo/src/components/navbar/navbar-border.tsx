import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "~/lib/utils/cn"

export const NavbarBorder = () => {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 200], [0, 1])

  return (
    <motion.span
      className={cn("h-[1px] bg-primary transition-all group-hover:top-0")}
      style={{ opacity }}
    />
  )
}
