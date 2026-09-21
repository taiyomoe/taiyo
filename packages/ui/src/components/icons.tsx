import {
  Alert02Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CornerDownLeftIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MinusSignIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
  SidebarLeft01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import type * as React from "react"
import { cn } from "@/utils/cn"
import type { Sx } from "../styles/sx"

/**
 * The icon set. Hugeicons is the only icon dependency: components import a
 * semantic name from here rather than reaching for the icon library, so the
 * set can be swapped or a glyph re-mapped in one place.
 *
 * Hugeicons strokes at 1.5, which is what gives the lighter, more precise line
 * the design language is after.
 */
export type IconProps = Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon">

function icon(glyph: IconSvgElement): (props: IconProps) => React.ReactElement {
  return function Icon(props: IconProps): React.ReactElement {
    return <HugeiconsIcon icon={glyph} {...props} />
  }
}

export const ChevronDown: (props: IconProps) => React.ReactElement = icon(ArrowDown01Icon)

export const ChevronUp: (props: IconProps) => React.ReactElement = icon(ArrowUp01Icon)

export const ChevronLeft: (props: IconProps) => React.ReactElement = icon(ArrowLeft01Icon)

export const ChevronRight: (props: IconProps) => React.ReactElement = icon(ArrowRight01Icon)

/**
 * Hugeicons' `UnfoldMore` is a pair of CURVED chevrons that collapse into a
 * rhombus below ~16px — unreadable at the 12px a select trigger uses. Every
 * trigger uses the plain chevron instead, which is also the conventional
 * affordance for a control that opens a list downwards.
 */
export const ChevronsUpDown: (props: IconProps) => React.ReactElement = icon(ArrowDown01Icon)

export const Close: (props: IconProps) => React.ReactElement = icon(Cancel01Icon)

export const Search: (props: IconProps) => React.ReactElement = icon(Search01Icon)

export const Plus: (props: IconProps) => React.ReactElement = icon(PlusSignIcon)

export const Minus: (props: IconProps) => React.ReactElement = icon(MinusSignIcon)

export const Ellipsis: (props: IconProps) => React.ReactElement = icon(MoreHorizontalIcon)

export const PanelLeft: (props: IconProps) => React.ReactElement = icon(SidebarLeft01Icon)

/**
 * The indicator tick. Hand-drawn rather than taken from Hugeicons: selection
 * indicators need a heavier, blunter stroke than the 1.5 the set draws at, and
 * they scale down to 12px inside menu and select rows.
 */
export function Check({
  className,
  strokeWidth = 2,
  style,
  sx,
  ...props
}: React.ComponentProps<"svg"> & { sx?: Sx }): React.ReactElement {
  const styleProps = stylex.props(sx)

  return (
    <svg
      aria-hidden="true"
      className={cn(styleProps.className, className)}
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      style={{ ...styleProps.style, ...style }}
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
    </svg>
  )
}

export const Enter: (props: IconProps) => React.ReactElement = icon(CornerDownLeftIcon)

export const Spinner: (props: IconProps) => React.ReactElement = icon(Loading03Icon)

export const AlertCircle: (props: IconProps) => React.ReactElement = icon(AlertCircleIcon)

export const AlertTriangle: (props: IconProps) => React.ReactElement = icon(Alert02Icon)

export const CheckCircle: (props: IconProps) => React.ReactElement = icon(CheckmarkCircle02Icon)

export const Info: (props: IconProps) => React.ReactElement = icon(InformationCircleIcon)
