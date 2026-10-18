import type * as React from "react"
import {
  Alert02Icon,
  AlertCircleIcon,
  Book02Icon,
  LanguageSkillIcon,
  Bookmark02Icon,
  BubbleChatIcon,
  Clock01Icon,
  GridViewIcon,
  FireIcon,
  HistoryIcon,
  Home01Icon,
  LeftToRightListBulletIcon,
  Logout01Icon,
  Menu02Icon,
  Menu01Icon,
  ShuffleIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  Sun03Icon,
  UserGroupIcon,
  UserIcon,
  ViewIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  ComputerIcon,
  CornerDownLeftIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MinusSignIcon,
  Moon02Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
  SidebarLeft01Icon,
  CloudUploadIcon,
  Comment01Icon,
  DashboardSquare01Icon,
  Flag02Icon,
  Image01Icon,
  ImageCompositionIcon,
  LeftToRightListNumberIcon,
  LibraryIcon,
  MaskTheater01Icon,
  Notification01Icon,
  PenTool02Icon,
  Settings01Icon,
  Shield01Icon,
  Tag01Icon,
  Upload04Icon,
  UserAdd01Icon,
  UserCheck01Icon,
  ArrowUpRight01Icon,
  CrownIcon,
  Edit02Icon,
  Link01Icon,
  Mail01Icon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import * as stylex from "@stylexjs/stylex"
import type { Sx } from "../styles/sx"
import { cn } from "../utils/cn"

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

export const Book: (props: IconProps) => React.ReactElement = icon(Book02Icon)

export const Bookmark: (props: IconProps) => React.ReactElement = icon(Bookmark02Icon)

export const History: (props: IconProps) => React.ReactElement = icon(HistoryIcon)

export const List: (props: IconProps) => React.ReactElement = icon(LeftToRightListBulletIcon)

export const Users: (props: IconProps) => React.ReactElement = icon(UserGroupIcon)

export const Forum: (props: IconProps) => React.ReactElement = icon(BubbleChatIcon)

export const User: (props: IconProps) => React.ReactElement = icon(UserIcon)

export const Logout: (props: IconProps) => React.ReactElement = icon(Logout01Icon)

export const Menu: (props: IconProps) => React.ReactElement = icon(Menu01Icon)

export const Sun: (props: IconProps) => React.ReactElement = icon(Sun03Icon)

export const Moon: (props: IconProps) => React.ReactElement = icon(Moon02Icon)

export const Monitor: (props: IconProps) => React.ReactElement = icon(ComputerIcon)

export const ArrowLeft: (props: IconProps) => React.ReactElement = icon(ArrowLeft02Icon)

export const ArrowRight: (props: IconProps) => React.ReactElement = icon(ArrowRight02Icon)

export const Clock: (props: IconProps) => React.ReactElement = icon(Clock01Icon)

export const Grid: (props: IconProps) => React.ReactElement = icon(GridViewIcon)

export const Rows: (props: IconProps) => React.ReactElement = icon(Menu02Icon)

export const Eye: (props: IconProps) => React.ReactElement = icon(ViewIcon)

export const Languages: (props: IconProps) => React.ReactElement = icon(LanguageSkillIcon)

export const Dashboard: (props: IconProps) => React.ReactElement = icon(DashboardSquare01Icon)

export const Library: (props: IconProps) => React.ReactElement = icon(LibraryIcon)

export const ListNumbered: (props: IconProps) => React.ReactElement =
  icon(LeftToRightListNumberIcon)

export const CloudUpload: (props: IconProps) => React.ReactElement = icon(CloudUploadIcon)

export const Image: (props: IconProps) => React.ReactElement = icon(Image01Icon)

export const Banner: (props: IconProps) => React.ReactElement = icon(ImageCompositionIcon)

export const Tag: (props: IconProps) => React.ReactElement = icon(Tag01Icon)

export const PenTool: (props: IconProps) => React.ReactElement = icon(PenTool02Icon)

export const Mask: (props: IconProps) => React.ReactElement = icon(MaskTheater01Icon)

export const Comment: (props: IconProps) => React.ReactElement = icon(Comment01Icon)

export const Flag: (props: IconProps) => React.ReactElement = icon(Flag02Icon)

export const Shield: (props: IconProps) => React.ReactElement = icon(Shield01Icon)

export const Settings: (props: IconProps) => React.ReactElement = icon(Settings01Icon)

export const Bell: (props: IconProps) => React.ReactElement = icon(Notification01Icon)

export const Upload: (props: IconProps) => React.ReactElement = icon(Upload04Icon)

export const UserAdd: (props: IconProps) => React.ReactElement = icon(UserAdd01Icon)

export const UserCheck: (props: IconProps) => React.ReactElement = icon(UserCheck01Icon)

function caret(
  path: string,
): (props: React.ComponentProps<"svg"> & { sx?: Sx }) => React.ReactElement {
  return function Caret({ className, style, sx, ...props }): React.ReactElement {
    const styleProps = stylex.props(sx)

    return (
      <svg
        aria-hidden="true"
        className={cn(styleProps.className, className)}
        fill="currentColor"
        height="24"
        style={{ ...styleProps.style, ...style }}
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path d={path} />
      </svg>
    )
  }
}

export const CaretUp: (props: React.ComponentProps<"svg"> & { sx?: Sx }) => React.ReactElement =
  caret("M12 5.5 21 18.5H3z")

export const CaretDown: (props: React.ComponentProps<"svg"> & { sx?: Sx }) => React.ReactElement =
  caret("M12 18.5 3 5.5h18z")

export const Link: (props: IconProps) => React.ReactElement = icon(Link01Icon)

export const Mail: (props: IconProps) => React.ReactElement = icon(Mail01Icon)

export const Crown: (props: IconProps) => React.ReactElement = icon(CrownIcon)

export const Edit: (props: IconProps) => React.ReactElement = icon(Edit02Icon)

export const ExternalLink: (props: IconProps) => React.ReactElement = icon(ArrowUpRight01Icon)

export const UserRemove: (props: IconProps) => React.ReactElement = icon(UserRemove01Icon)
