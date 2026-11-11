import type * as React from "react"
import {
  Share08Icon,
  FavouriteIcon,
  AtIcon,
  SentIcon,
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
  FileEditIcon,
  NoteEditIcon,
  Link01Icon,
  Mail01Icon,
  UserRemove01Icon,
  CalendarClockIcon,
  Globe02Icon,
  Key01Icon,
  Coins01Icon,
  Package01Icon,
  Store01Icon,
  VolumeHighIcon,
  VolumeOffIcon,
  ArrowUpDownIcon,
  Calendar03Icon,
  Copy01Icon,
  LegalDocument01Icon,
  Login01Icon,
  RefreshIcon,
  Robot01Icon,
  SearchAddIcon,
  SearchMinusIcon,
  SourceCodeIcon,
  PlayIcon,
  PauseIcon,
  FullScreenIcon,
  MinimizeScreenIcon,
  Undo02Icon,
  PipetteIcon,
  ViewOffSlashIcon,
  BookmarkAdd02Icon,
  BookmarkRemove02Icon,
  Download04Icon,
  ZoomInIcon,
  ZoomOutIcon,
  Delete02Icon,
  WifiOffIcon,
  TickDouble02Icon,
  Mortarboard01Icon,
  TextBoldIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  SortByDown02Icon,
  SortByUp02Icon,
  ClockArrowDownIcon,
  ClockArrowUpIcon,
  SortingAZ01Icon,
  SortingZA01Icon,
  SortingNineOneIcon,
  SortingOneNineIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  ShieldCheckIcon,
  KissingIcon,
  SkullIcon,
  BookOpenTextIcon,
  MoreHorizontalCircle01Icon,
  StarIcon,
  SmileIcon,
  ThumbsUpIcon,
  ArrowTurnBackwardIcon,
  ImageAdd02Icon,
  ImageNotFound01Icon,
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

export const Comment: (props: IconProps) => React.ReactElement = icon(Comment01Icon)

export const Flag: (props: IconProps) => React.ReactElement = icon(Flag02Icon)

export const Shield: (props: IconProps) => React.ReactElement = icon(Shield01Icon)

export const Settings: (props: IconProps) => React.ReactElement = icon(Settings01Icon)

export const Bell: (props: IconProps) => React.ReactElement = icon(Notification01Icon)

export const Upload: (props: IconProps) => React.ReactElement = icon(Upload04Icon)

export const UserAdd: (props: IconProps) => React.ReactElement = icon(UserAdd01Icon)

export const UserCheck: (props: IconProps) => React.ReactElement = icon(UserCheck01Icon)

export const Copy: (props: IconProps) => React.ReactElement = icon(Copy01Icon)

export const Login: (props: IconProps) => React.ReactElement = icon(Login01Icon)

export const Refresh: (props: IconProps) => React.ReactElement = icon(RefreshIcon)

export const Code: (props: IconProps) => React.ReactElement = icon(SourceCodeIcon)

export const LegalDocument: (props: IconProps) => React.ReactElement = icon(LegalDocument01Icon)

export const Play: (props: IconProps) => React.ReactElement = icon(PlayIcon)

export const Pause: (props: IconProps) => React.ReactElement = icon(PauseIcon)

export const Fullscreen: (props: IconProps) => React.ReactElement = icon(FullScreenIcon)

export const ExitFullscreen: (props: IconProps) => React.ReactElement = icon(MinimizeScreenIcon)

export const Undo: (props: IconProps) => React.ReactElement = icon(Undo02Icon)

export const Pipette: (props: IconProps) => React.ReactElement = icon(PipetteIcon)

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

export const FileEdit: (props: IconProps) => React.ReactElement = icon(FileEditIcon)

export const NoteEdit: (props: IconProps) => React.ReactElement = icon(NoteEditIcon)

export const ExternalLink: (props: IconProps) => React.ReactElement = icon(ArrowUpRight01Icon)

export const UserRemove: (props: IconProps) => React.ReactElement = icon(UserRemove01Icon)

export const CalendarClock: (props: IconProps) => React.ReactElement = icon(CalendarClockIcon)

export const Globe: (props: IconProps) => React.ReactElement = icon(Globe02Icon)

export const Key: (props: IconProps) => React.ReactElement = icon(Key01Icon)

export const Coins: (props: IconProps) => React.ReactElement = icon(Coins01Icon)

export const Package: (props: IconProps) => React.ReactElement = icon(Package01Icon)

export const Store: (props: IconProps) => React.ReactElement = icon(Store01Icon)

export const Volume: (props: IconProps) => React.ReactElement = icon(VolumeHighIcon)

export const VolumeOff: (props: IconProps) => React.ReactElement = icon(VolumeOffIcon)

export const Calendar: (props: IconProps) => React.ReactElement = icon(Calendar03Icon)

export const FilterIn: (props: IconProps) => React.ReactElement = icon(SearchAddIcon)

export const FilterOut: (props: IconProps) => React.ReactElement = icon(SearchMinusIcon)

export const ArrowUpDown: (props: IconProps) => React.ReactElement = icon(ArrowUpDownIcon)

export const Robot: (props: IconProps) => React.ReactElement = icon(Robot01Icon)

export const EyeOff: (props: IconProps) => React.ReactElement = icon(ViewOffSlashIcon)

export const BookmarkAdd: (props: IconProps) => React.ReactElement = icon(BookmarkAdd02Icon)

export const BookmarkRemove: (props: IconProps) => React.ReactElement = icon(BookmarkRemove02Icon)

export const Download: (props: IconProps) => React.ReactElement = icon(Download04Icon)

export const ZoomIn: (props: IconProps) => React.ReactElement = icon(ZoomInIcon)

export const ZoomOut: (props: IconProps) => React.ReactElement = icon(ZoomOutIcon)

export const Trash: (props: IconProps) => React.ReactElement = icon(Delete02Icon)

export const Offline: (props: IconProps) => React.ReactElement = icon(WifiOffIcon)

export const CheckAll: (props: IconProps) => React.ReactElement = icon(TickDouble02Icon)

export const GraduationCap: (props: IconProps) => React.ReactElement = icon(Mortarboard01Icon)

export const Bold: (props: IconProps) => React.ReactElement = icon(TextBoldIcon)

export const Italic: (props: IconProps) => React.ReactElement = icon(TextItalicIcon)

export const Underline: (props: IconProps) => React.ReactElement = icon(TextUnderlineIcon)

export const Strikethrough: (props: IconProps) => React.ReactElement = icon(TextStrikethroughIcon)

export const SortDescending: (props: IconProps) => React.ReactElement = icon(SortByDown02Icon)

export const SortAscending: (props: IconProps) => React.ReactElement = icon(SortByUp02Icon)

export const ClockArrowDown: (props: IconProps) => React.ReactElement = icon(ClockArrowDownIcon)

export const ClockArrowUp: (props: IconProps) => React.ReactElement = icon(ClockArrowUpIcon)

export const SortAZ: (props: IconProps) => React.ReactElement = icon(SortingAZ01Icon)

export const SortZA: (props: IconProps) => React.ReactElement = icon(SortingZA01Icon)

export const SortNineOne: (props: IconProps) => React.ReactElement = icon(SortingNineOneIcon)

export const SortOneNine: (props: IconProps) => React.ReactElement = icon(SortingOneNineIcon)

export const CalendarArrowDown: (props: IconProps) => React.ReactElement =
  icon(CalendarArrowDownIcon)

export const CalendarArrowUp: (props: IconProps) => React.ReactElement = icon(CalendarArrowUpIcon)

export const ShieldCheck: (props: IconProps) => React.ReactElement = icon(ShieldCheckIcon)

export const Kissing: (props: IconProps) => React.ReactElement = icon(KissingIcon)

export const Skull: (props: IconProps) => React.ReactElement = icon(SkullIcon)

export const BookOpenText: (props: IconProps) => React.ReactElement = icon(BookOpenTextIcon)

export const MoreCircle: (props: IconProps) => React.ReactElement = icon(MoreHorizontalCircle01Icon)

export const Star: (props: IconProps) => React.ReactElement = icon(StarIcon)

export const Smile: (props: IconProps) => React.ReactElement = icon(SmileIcon)

export const ThumbsUp: (props: IconProps) => React.ReactElement = icon(ThumbsUpIcon)

export const Reply: (props: IconProps) => React.ReactElement = icon(ArrowTurnBackwardIcon)

export const ImageAdd: (props: IconProps) => React.ReactElement = icon(ImageAdd02Icon)

export const ImageMissing: (props: IconProps) => React.ReactElement = icon(ImageNotFound01Icon)

export const Share: (props: IconProps) => React.ReactElement = icon(Share08Icon)

export const Heart: (props: IconProps) => React.ReactElement = icon(FavouriteIcon)

export const At: (props: IconProps) => React.ReactElement = icon(AtIcon)

export const Send: (props: IconProps) => React.ReactElement = icon(SentIcon)
