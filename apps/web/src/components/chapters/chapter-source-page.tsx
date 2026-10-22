import * as stylex from "@stylexjs/stylex"
import { ArrowLeft, ExternalLink, Globe, Info } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Suspense } from "react"
import type { Session } from "@/lib/queries/session"
import { getChapterLabel } from "@/components/chapters/chapter-meta"
import { Cover } from "@/components/media/cover"
import { getMainTitle } from "@/components/media/media-labels"
import { AppShell } from "@/components/shell/app-shell"
import { hostOf } from "@/lib/chapter-batch/links"
import { chapterGroupsQueryOptions } from "@/lib/queries/chapters"
import { mediaQueryOptions } from "@/lib/queries/medias"
import { chapterQueryOptions } from "@/lib/queries/submissions"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    paddingBlock: { default: "2rem", "@media (width >= 48rem)": "4rem" },
    paddingInline: "1rem",
    display: "flex",
    justifyContent: "center",
  },
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
  heading: {
    gap: "1rem",
    alignItems: "center",
    display: "flex",
  },
  cover: {
    flexShrink: 0,
    width: "3.5rem",
  },
  headingText: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  eyebrow: {
    margin: 0,
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  title: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.heading,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.015em",
  },
  text: {
    margin: 0,
    color: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
    fontSize: "0.9375rem",
    lineHeight: 1.55,
  },
  destination: {
    padding: "0.875rem",
    borderRadius: radius.md,
    gap: "0.75rem",
    alignItems: "center",
    backgroundColor: colors.well,
    boxShadow: shadows.sunken,
    display: "flex",
    minWidth: 0,
  },
  destinationIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  destinationText: {
    gap: "0.125rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  host: {
    color: colors.foreground,
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  url: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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

function ChapterSource({ chapterId }: { chapterId: string }) {
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
      <div sx={styles.heading}>
        <Cover
          src={media.data?.covers.find((cover) => cover.isMainCover)?.url ?? null}
          sx={styles.cover}
        />
        <div sx={styles.headingText}>
          <p sx={styles.eyebrow}>
            {mediaTitle} · {label}
          </p>
          <h1 sx={styles.title}>
            {chapter.externalUrl === null ? m.leave_missing_title() : m.leave_title()}
          </h1>
        </div>
      </div>
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
          <div sx={styles.destination}>
            <Globe size={20} {...stylex.props(styles.destinationIcon)} />
            <div sx={styles.destinationText}>
              <span sx={styles.host}>{hostOf(chapter.externalUrl)}</span>
              <span sx={styles.url} title={chapter.externalUrl}>
                {chapter.externalUrl}
              </span>
            </div>
          </div>
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

export function ChapterSourcePage({
  chapterId,
  user,
}: {
  chapterId: string
  user: Session["user"] | null
}) {
  return (
    <AppShell user={user}>
      <div sx={styles.root}>
        <Suspense>
          <ChapterSource chapterId={chapterId} />
        </Suspense>
      </div>
    </AppShell>
  )
}
