import { type MotionProps, motion, useAnimate, usePresence } from "motion/react"
import { useCallback, useEffect } from "react"
import { useAuthStore } from "~/stores/auth-flow.store"

export const AuthAnimatedSlide = (props: MotionProps) => {
  const [isPresent, safeToRemove] = usePresence()
  const [scope, animate] = useAnimate()
  const { direction } = useAuthStore()

  const enterAnimation = useCallback(async () => {
    await animate(scope.current, { x: 0, opacity: 1 }, { duration: 0.2 })
  }, [animate, scope.current])

  const exitAnimation = useCallback(async () => {
    await animate(
      scope.current,
      { x: direction === 1 ? -30 : 30, opacity: 0 },
      { duration: 0.2 },
    )

    if (safeToRemove) safeToRemove()
  }, [animate, scope.current, direction, safeToRemove])

  useEffect(() => {
    if (isPresent) enterAnimation()
    if (!isPresent) exitAnimation()
  }, [isPresent, enterAnimation, exitAnimation])

  return (
    <motion.div
      ref={scope}
      initial={{ x: direction === 1 ? 30 : -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      {...props}
    />
  )
}
