import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  BookOpen,
  CancelCircle,
  CheckCircle,
  Hourglass,
  PauseCircle,
  Repeat,
} from "@taiyomoe/ui/components/icons"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { LibraryStatus } from "@/features/library/api/library"
import { m } from "@/paraglide/messages"

export const LIBRARY_STATUSES = [
  "READING",
  "PLAN_TO_READ",
  "REREADING",
  "ON_HOLD",
  "COMPLETED",
  "DROPPED",
] as const satisfies LibraryStatus[]

export const LIBRARY_STATUS_LABELS: Record<LibraryStatus, () => string> = {
  READING: m.library_status_reading,
  REREADING: m.library_status_rereading,
  PLAN_TO_READ: m.library_status_plan_to_read,
  COMPLETED: m.library_status_completed,
  ON_HOLD: m.library_status_on_hold,
  DROPPED: m.library_status_dropped,
}

export const LIBRARY_STATUS_ICONS: Record<LibraryStatus, (props: IconProps) => ReactElement> = {
  READING: BookOpen,
  REREADING: Repeat,
  PLAN_TO_READ: Hourglass,
  COMPLETED: CheckCircle,
  ON_HOLD: PauseCircle,
  DROPPED: CancelCircle,
}

export const libraryStatusTones = stylex.create({
  READING: { color: colors.primary },
  REREADING: { color: colors.chart3 },
  PLAN_TO_READ: { color: colors.info },
  COMPLETED: { color: colors.success },
  ON_HOLD: { color: colors.warning },
  DROPPED: { color: colors.mutedForeground },
})

export const SILENT_LIBRARY_STATUSES: ReadonlySet<LibraryStatus> = new Set(["DROPPED", "COMPLETED"])
