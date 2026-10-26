import * as stylex from "@stylexjs/stylex"
import { Book, Bookmark, Check, Edit } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@taiyomoe/ui/components/ui/popover"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useDeferredValue } from "react"
import { TimeAgo } from "@/components/time/time-ago"
import {
  type LibraryStatus,
  type ReadingProgress,
  libraryEntryQueryOptions,
  readingProgressQueryOptions,
  useSetLibraryStatus,
} from "@/features/media/api/library"
import { LIBRARY_STATUSES, LIBRARY_STATUS_LABELS } from "@/features/media/lib/media-labels"
import { useCurrentHref } from "@/hooks/use-current-href"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  actions: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  cta: {
    width: "100%",
  },
  library: {
    justifyContent: "center",
    width: "100%",
  },
  libraryActive: {
    backgroundColor: `color-mix(in srgb, ${colors.primary} 12%, ${colors.card})`,
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
  },
  menu: {
    minWidth: "14rem",
  },
  card: {
    padding: "1rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  percent: {
    color: colors.primary,
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    fontWeight: 600,
  },
  detail: {
    margin: 0,
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: font.mono,
    fontSize: "0.75rem",
  },
  prompt: {
    gap: "0.5rem",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(18rem, calc(100vw - 2rem))",
  },
  promptTitle: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  promptText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  promptActions: {
    gap: "0.5rem",
    display: "flex",
    paddingTop: "0.375rem",
  },
  skeletonButton: {
    borderRadius: radius.full,
    height: "2.75rem",
  },
})

export function ReadingActions({
  mediaId,
  signedIn,
  canEdit,
}: {
  mediaId: string
  signedIn: boolean
  canEdit: boolean
}) {
  return signedIn ? <SignedInActions canEdit={canEdit} mediaId={mediaId} /> : <SignedOutActions />
}

function SignedOutActions() {
  const href = useCurrentHref()

  return (
    <div sx={styles.actions}>
      <ReadButton progress={null} />
      <Popover>
        <PopoverTrigger render={<Button sx={styles.library} variant="outline" />}>
          <Bookmark />
          {m.media_library_add()}
        </PopoverTrigger>
        <PopoverPopup align="center" arrow side="bottom">
          <div sx={styles.prompt}>
            <PopoverTitle sx={styles.promptTitle}>{m.media_sign_in_title()}</PopoverTitle>
            <PopoverDescription sx={styles.promptText}>
              {m.media_sign_in_description()}
            </PopoverDescription>
            <div sx={styles.promptActions}>
              <Button render={<Link search={{ redirect: href }} to="/auth/sign-in" />} size="sm">
                {m.auth_sign_in()}
              </Button>
              <Button
                render={<Link search={{ redirect: href }} to="/auth/sign-up" />}
                size="sm"
                variant="outline"
              >
                {m.auth_sign_up()}
              </Button>
            </div>
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  )
}

function SignedInActions({ mediaId, canEdit }: { mediaId: string; canEdit: boolean }) {
  const contentRatings = useDeferredValue(useSettings().contentRatings)
  const progress = useQuery(readingProgressQueryOptions(mediaId, contentRatings))
  const entry = useQuery(libraryEntryQueryOptions(mediaId))

  return (
    <div sx={styles.actions}>
      {progress.data === undefined ? (
        <Skeleton sx={styles.skeletonButton} />
      ) : (
        <ReadButton progress={progress.data} />
      )}
      {entry.data === undefined ? (
        <Skeleton sx={styles.skeletonButton} />
      ) : (
        <LibraryButton mediaId={mediaId} status={entry.data?.status ?? null} />
      )}
      {progress.data === undefined || progress.data.lastRead === null ? null : (
        <ProgressCard progress={progress.data} />
      )}
      <Button
        render={<Link params={{ mediaId }} to="/media/$mediaId/edit" />}
        sx={styles.library}
        variant="ghost"
      >
        <Edit />
        {canEdit ? m.media_edit() : m.media_suggest_edit()}
      </Button>
    </div>
  )
}

const getReadLabel = (progress: ReadingProgress | null) => {
  const next = progress?.next ?? null

  if ((progress?.lastRead ?? null) === null) {
    return m.media_start_reading()
  }

  return next === null ? m.media_caught_up() : m.media_continue({ number: next.number })
}

function ReadButton({ progress }: { progress: ReadingProgress | null }) {
  return (
    <span title={m.media_reader_soon()}>
      <Button disabled size="lg" sx={styles.cta}>
        <Book />
        {getReadLabel(progress)}
      </Button>
    </span>
  )
}

function LibraryButton({ mediaId, status }: { mediaId: string; status: LibraryStatus | null }) {
  const setStatus = useSetLibraryStatus(mediaId)

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            sx={[styles.library, status !== null && styles.libraryActive]}
            variant={status === null ? "outline" : "secondary"}
          />
        }
      >
        {status === null ? <Bookmark /> : <Check />}
        {status === null ? m.media_library_add() : LIBRARY_STATUS_LABELS[status]()}
      </MenuTrigger>
      <MenuPopup align="center" sx={styles.menu}>
        <MenuRadioGroup
          onValueChange={(value: LibraryStatus) => {
            setStatus.mutate(value)
          }}
          value={status}
        >
          {LIBRARY_STATUSES.map((value) => (
            <MenuRadioItem key={value} value={value}>
              {LIBRARY_STATUS_LABELS[value]()}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
        {status === null ? null : (
          <>
            <MenuSeparator />
            <MenuItem
              onClick={() => {
                setStatus.mutate(null)
              }}
              variant="destructive"
            >
              {m.media_library_remove()}
            </MenuItem>
          </>
        )}
      </MenuPopup>
    </Menu>
  )
}

function ProgressCard({ progress }: { progress: ReadingProgress }) {
  const percent =
    progress.totalCount === 0 ? 0 : Math.round((progress.readCount / progress.totalCount) * 100)

  return (
    <section aria-label={m.media_progress_title()} sx={styles.card}>
      <div sx={styles.cardHeader}>
        <span sx={styles.cardLabel}>{m.media_progress_title()}</span>
        <span sx={styles.percent}>{percent}%</span>
      </div>
      <Progress aria-label={m.media_progress_title()} value={percent} />
      <p sx={styles.detail}>
        {m.media_progress_detail({ read: progress.readCount, total: progress.totalCount })}
      </p>
      {progress.lastRead === null ? null : (
        <p sx={styles.detail}>
          {m.media_progress_last({ number: progress.lastRead.number })}
          <span aria-hidden>·</span>
          <TimeAgo date={progress.lastRead.readAt} />
        </p>
      )}
    </section>
  )
}
