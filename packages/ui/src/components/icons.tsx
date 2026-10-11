import {
  Alert02Icon,
  AlertCircleIcon,
  Bookmark02Icon,
  BubbleChatIcon,
  FireIcon,
  HistoryIcon,
  Home01Icon,
  LeftToRightListBulletIcon,
  Logout01Icon,
  Menu01Icon,
  ShuffleIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  UserGroupIcon,
  UserIcon,
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

export const ChevronsUpDown: (props: IconProps) => React.ReactElement = icon(ArrowDown01Icon)

export const Close: (props: IconProps) => React.ReactElement = icon(Cancel01Icon)

export const Search: (props: IconProps) => React.ReactElement = icon(Search01Icon)

export const Plus: (props: IconProps) => React.ReactElement = icon(PlusSignIcon)

export const Minus: (props: IconProps) => React.ReactElement = icon(MinusSignIcon)

export const Ellipsis: (props: IconProps) => React.ReactElement = icon(MoreHorizontalIcon)

export const PanelLeft: (props: IconProps) => React.ReactElement = icon(SidebarLeft01Icon)

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

export const Home: (props: IconProps) => React.ReactElement = icon(Home01Icon)

export const Sliders: (props: IconProps) => React.ReactElement = icon(SlidersHorizontalIcon)

export const Sparkles: (props: IconProps) => React.ReactElement = icon(SparklesIcon)

export const Flame: (props: IconProps) => React.ReactElement = icon(FireIcon)

export const Shuffle: (props: IconProps) => React.ReactElement = icon(ShuffleIcon)

export const Bookmark: (props: IconProps) => React.ReactElement = icon(Bookmark02Icon)

export const History: (props: IconProps) => React.ReactElement = icon(HistoryIcon)

export const List: (props: IconProps) => React.ReactElement = icon(LeftToRightListBulletIcon)

export const Users: (props: IconProps) => React.ReactElement = icon(UserGroupIcon)

export const Forum: (props: IconProps) => React.ReactElement = icon(BubbleChatIcon)

export const User: (props: IconProps) => React.ReactElement = icon(UserIcon)

export const Logout: (props: IconProps) => React.ReactElement = icon(Logout01Icon)

export const Menu: (props: IconProps) => React.ReactElement = icon(Menu01Icon)
