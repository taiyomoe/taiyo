import {
  type HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { cn } from "~/utils/cn"

type ShadowState = "top" | "bottom" | "top-bottom" | "none"

type Props = HTMLAttributes<HTMLDivElement>

export const ScrollShadow = ({ className, ...props }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shadowState, setShadowState] = useState<ShadowState>("none")

  const checkScroll = useCallback(() => {
    const container = containerRef.current

    if (!container) return

    const isScrolledFromTop = container.scrollTop > 10
    const canScrollMore =
      container.scrollHeight - container.scrollTop - container.clientHeight > 10

    if (isScrolledFromTop && canScrollMore) {
      setShadowState("top-bottom")
    } else if (isScrolledFromTop) {
      setShadowState("top")
    } else if (canScrollMore) {
      setShadowState("bottom")
    } else {
      setShadowState("none")
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    checkScroll()

    container.addEventListener("scroll", checkScroll)
    window.addEventListener("resize", checkScroll)

    return () => {
      container.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll])

  return (
    <div
      ref={containerRef}
      className={cn(
        "scrollbar-thin scrollbar-thumb-emphasis scrollbar-thumb-rounded-full scrollbar-track-transparent overflow-y-auto data-[scroll-state=bottom]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_40px),transparent)] data-[scroll-state=top-bottom]:[mask-image:linear-gradient(#000,#000,transparent_0,#000_40px,#000_calc(100%_-_40px),transparent)] data-[scroll-state=top]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_40px),transparent)]",
        className,
      )}
      data-scroll-state={shadowState}
      {...props}
    />
  )
}
