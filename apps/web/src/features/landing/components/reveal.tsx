import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useEffect, useRef, useState } from "react"

const styles = stylex.create({
  reveal: {
    transitionProperty: "opacity, transform",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  },
})

type RevealProps = {
  children: ReactNode
  delay?: number
}

export const Reveal = ({ children, delay = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  const revealProps = stylex.props(styles.reveal)

  useEffect(() => {
    const el = ref.current

    if (!el) {
      return undefined
    }

    if (typeof IntersectionObserver === "undefined") {
      const immediate = setTimeout(() => {
        setSeen(true)
      }, 0)

      return () => {
        clearTimeout(immediate)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setSeen(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(el)

    const fallback = setTimeout(() => {
      setSeen(true)
    }, 1600)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={revealProps.className}
      style={{
        ...revealProps.style,
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translateY(28px)",
        transitionDuration: "700ms",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
