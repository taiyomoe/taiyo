import * as stylex from "@stylexjs/stylex"
import { ArrowLeft, ExternalLink, Info } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { chapterGroupsQueryOptions } from "@/features/chapters/api/chapters"
import { ChapterSourceDestination } from "@/features/chapters/components/chapter-source/chapter-source-destination"
import { ChapterSourceHeading } from "@/features/chapters/components/chapter-source/chapter-source-heading"
import { getChapterLabel } from "@/features/chapters/lib/chapter-label"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { getMainTitle } from "@/features/media/lib/media-labels"
import { chapterQueryOptions } from "@/features/uploads/api/submissions"
import { hostOf } from "@/features/uploads/lib/chapter-batch/links"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  card: {
    padding: "1.25rem",
    borderColor: colors.border,
    borderRadius: radius.xxxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    display: "flex",
    flexDirection: "column",
    maxWidth: "34rem",
    width: "100%",
  },
  text: {
    margin: 0,
    color: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
    fontSize: "0.9375rem",
    lineHeight: 1.55,
  },
  warning: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  warningIcon: {
    flexShrink: 0,
    marginTop: "0.125rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
})

export function ChapterSource({ chapterId }: { chapterId: string }) {
  const { data: chapter } = useSuspenseQuery(chapterQueryOptions(chapterId))
  const media = useQuery(mediaQueryOptions(chapter.mediaId))
  const groups = useQuery(chapterGroupsQueryOptions(chapterId))
  const mediaTitle =
    (media.data === undefined ? null : getMainTitle(media.data.titles)) ?? m.media_untitled()
  const label = getChapterLabel(chapter)
  const groupNames = (groups.data ?? []).map((group) => group.name)
  const back = (
    <Button
      render={<Link params={{ mediaId: chapter.mediaId }} to="/media/$mediaId" />}
      variant="outline"
    >
      <ArrowLeft />
      {m.leave_back()}
    </Button>
  )

  return (
    <div sx={styles.card}>
      <ChapterSourceHeading
        coverUrl={media.data?.covers.find((cover) => cover.isMainCover)?.url ?? null}
        label={label}
        mediaTitle={mediaTitle}
        title={chapter.externalUrl === null ? m.leave_missing_title() : m.leave_title()}
      />
      {chapter.externalUrl === null ? (
        <>
          <p sx={styles.text}>{m.leave_missing_description()}</p>
          <div sx={styles.actions}>{back}</div>
        </>
      ) : (
        <>
          <p sx={styles.text}>
            {m.leave_description({ chapter: label, media: mediaTitle })}
            {groupNames.length === 0
              ? null
              : ` ${m.leave_groups({ groups: groupNames.join(", ") })}`}
          </p>
          <ChapterSourceDestination url={chapter.externalUrl} />
          <p sx={styles.warning}>
            <Info size={14} {...stylex.props(styles.warningIcon)} />
            {m.leave_warning()}
          </p>
          <div sx={styles.actions}>
            {back}
            <Button render={<a href={chapter.externalUrl} rel="noopener nofollow ugc" />}>
              {m.leave_continue({ host: hostOf(chapter.externalUrl) })}
              <ExternalLink />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
