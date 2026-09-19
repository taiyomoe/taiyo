import * as stylex from "@stylexjs/stylex"
import { Link } from "@tanstack/react-router"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import type { Sx } from "@taiyomoe/ui/styles/sx"
import { font, radius, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { cn } from "@taiyomoe/ui/utils/cn"
import type { ComponentProps, CSSProperties, ReactNode } from "react"

import { scene } from "@/components/scene/scene.stylex"

// Quick diagonal glint (0–26%) then a long rest off-screen (26–100%), so the
// button shines periodically instead of constantly. Both ends are off-screen.
const sheenSweep = stylex.keyframes({
  "0%": { transform: "translateX(-130%) skewX(-18deg)" },
  "26%, 100%": { transform: "translateX(330%) skewX(-18deg)" },
})
// The signature gradient CTA with an animated sheen. Custom (not a @taiyomoe/ui
// Button variant) because of the gradient fill + sheen overlay: it belongs to
// the brand scene, not to the themed component set.
const styles = stylex.create({
  base: {
    borderRadius: radius.full,
    borderStyle: "none",
    overflow: "hidden",
    backgroundImage: `linear-gradient(95deg, ${scene.brand} 0%, #ff8a3d 50%, ${scene.gold} 100%)`,
    boxShadow: {
      default: `0 6px 18px color-mix(in srgb, ${scene.brand} 32%, transparent)`,
      ":disabled": `0 6px 18px color-mix(in srgb, ${scene.brand} 32%, transparent)`,
      ":hover": `0 10px 30px color-mix(in srgb, ${scene.brand} 50%, transparent)`,
    },
    color: scene.ink,
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    fontFamily: font.sans,
    fontWeight: 800,
    opacity: { default: 1, ":disabled": 0.7 },
    position: "relative",
    transform: { default: null, ":active": "scale(0.98)" },
    transitionDuration: "200ms",
    transitionProperty: "transform, box-shadow",
    whiteSpace: "nowrap",
  },
  // `:active` on the base would still fire while disabled. Nulling the whole
  // property here drops the base's conditional transform with it, which is
  // exactly what a disabled button wants.
  disabled: {
    transform: null,
  },
  md: {
    paddingInline: "1.5rem",
    fontSize: text.base,
    height: "3.375rem",
  },
  lg: {
    paddingInline: "2.125rem",
    fontSize: text.lg,
    height: "3.625rem",
  },
  block: {
    width: "100%",
  },
  // A <button> centres its content by default; an <a> does not.
  link: {
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    textDecorationLine: "none",
  },
  label: {
    gap: "0.5rem",
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  },
  labelLoading: {
    opacity: 0,
  },
  loader: {
    inset: 0,
    alignItems: "center",
    display: "inline-flex",
    justifyContent: "center",
    position: "absolute",
    zIndex: 2,
  },
  // Anchored at left-0 so the translate (relative to its own width) clears the
  // whole button; `backwards` keeps it off-screen before the first sweep.
  sheen: {
    animationDuration: "5s",
    animationFillMode: "backwards",
    animationIterationCount: "infinite",
    animationName: sheenSweep,
    animationTimingFunction: "ease-in-out",
    backgroundImage: "linear-gradient(90deg, transparent, rgba(255,249,236,0.55), transparent)",
    pointerEvents: "none",
    position: "absolute",
    zIndex: 1,
    bottom: 0,
    left: 0,
    top: 0,
    width: "33.3333%",
  },
})

type SunSkinProps = {
  size?: "md" | "lg"
  /** Stretch to the container width (the auth forms do). */
  block?: boolean
  sx?: Sx
}

/** The label + sheen layers every sun-skinned element renders. */
const SunBody = ({ children, loading }: { children: ReactNode; loading?: boolean }) => (
  <>
    <span sx={[styles.label, loading && styles.labelLoading]}>{children}</span>
    {loading ? (
      <span sx={styles.loader}>
        <Spinner />
      </span>
    ) : null}
    <span aria-hidden sx={styles.sheen} />
  </>
)

export type SunButtonProps = ComponentProps<"button"> &
  SunSkinProps & {
    loading?: boolean
  }

export const SunButton = ({
  className,
  children,
  loading = false,
  size = "md",
  block = false,
  disabled,
  style,
  sx,
  type = "button",
  ...props
}: SunButtonProps) => {
  const isDisabled = disabled || loading
  const styleProps = stylex.props(
    styles.base,
    styles[size],
    block && styles.block,
    isDisabled && styles.disabled,
    sx,
  )

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(styleProps.className, className)}
      style={{ ...styleProps.style, ...style }}
      {...props}
    >
      <SunBody loading={loading}>{children}</SunBody>
    </button>
  )
}

// TanStack's Link accepts a render-prop child; the sun skin wraps its children
// in layout spans, so only plain nodes make sense here.
export type SunLinkProps = Omit<ComponentProps<typeof Link>, "children"> &
  SunSkinProps & {
    children?: ReactNode
  }

/**
 * The same CTA as a router link. A `<button>` nested in an `<a>` is invalid
 * HTML and loses middle-click and "copy link address", so anything that
 * navigates uses this instead of wrapping SunButton.
 */
export const SunLink = ({
  className,
  children,
  size = "lg",
  block = false,
  style,
  sx,
  ...props
}: SunLinkProps) => {
  const styleProps = stylex.props(styles.base, styles.link, styles[size], block && styles.block, sx)

  return (
    <Link
      className={cn(styleProps.className, className)}
      style={{ ...styleProps.style, ...(style as CSSProperties) }}
      {...props}
    >
      <SunBody>{children}</SunBody>
    </Link>
  )
}
