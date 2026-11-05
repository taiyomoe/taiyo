import * as stylex from "@stylexjs/stylex"
import { Close, Download, Trash } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Progress } from "@taiyomoe/ui/components/ui/progress"
import { colors, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { OfflineChapterSource } from "@/features/offline/lib/offline-chapters"
import { useOfflineChapters } from "@/features/offline/hooks/use-offline-chapters"
import { SettingSection } from "@/features/reader/components/sheet/setting-controls"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  status: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  hint: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  error: {
    margin: 0,
    color: colors.destructive,
    fontSize: "0.75rem",
  },
  others: {
    margin: 0,
    padding: 0,
    gap: "0.25rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  other: {
    textDecoration: "none",
    color: {
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    fontSize: "0.8125rem",
    transitionDuration: motion.enter,
    transitionProperty: "color",
  },
})

export function OfflineSection({
  source,
}: {
  source: Omit<OfflineChapterSource, "contentRatings">
}) {
  const offline = useOfflineChapters()
  const { contentRatings } = useSettings()

  if (!offline.supported) {
    return null
  }

  const progress = offline.downloads.get(source.id)
  const downloaded = offline.chapters.some((chapter) => chapter.id === source.id)
  const others = offline.chapters.filter(
    (chapter) => chapter.mediaId === source.mediaId && chapter.id !== source.id,
  )
  const downloadedLabel = downloaded ? m.offline_available() : m.offline_not_downloaded()
  const action = downloaded ? (
    <Button
      onClick={() => {
        void offline.remove(source.id)
      }}
      size="sm"
      variant="outline"
    >
      <Trash />
      {m.offline_remove()}
    </Button>
  ) : (
    <Button
      onClick={() => {
        offline.download({ ...source, contentRatings })
      }}
      size="sm"
      variant="outline"
    >
      <Download />
      {m.offline_download()}
    </Button>
  )

  return (
    <SettingSection title={m.reader_section_offline()}>
      <div sx={styles.row}>
        <div sx={styles.status}>
          <span sx={styles.label}>
            {progress === undefined
              ? downloadedLabel
              : m.offline_downloading({ done: progress.done, total: progress.total })}
          </span>
          {offline.failed.has(source.id) ? (
            <p sx={styles.error}>{m.offline_failed()}</p>
          ) : (
            <p sx={styles.hint}>{m.offline_hint()}</p>
          )}
        </div>
        {progress === undefined ? (
          action
        ) : (
          <Button
            onClick={() => {
              offline.cancel(source.id)
            }}
            size="sm"
            variant="ghost"
          >
            <Close />
            {m.cancel()}
          </Button>
        )}
      </div>
      {progress === undefined ? null : (
        <Progress
          aria-label={m.offline_downloading({ done: progress.done, total: progress.total })}
          max={progress.total}
          value={progress.done}
        />
      )}
      {others.length === 0 ? null : (
        <ul aria-label={m.offline_others()} sx={styles.others}>
          {others.map((chapter) => (
            <li key={chapter.id}>
              <Link
                params={{ chapterId: chapter.id }}
                to="/chapters/$chapterId"
                {...stylex.props(styles.other)}
              >
                {m.offline_other_chapter({ chapter: chapter.label, pages: chapter.pageCount })}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SettingSection>
  )
}
