import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { colors, font, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LatestChapter } from "@/lib/queries/chapters"
import { ChapterGroups, ChapterNumber, TimeAgo, Uploader } from "@/components/chapters/chapter-meta"
import { LanguageChip } from "@/components/chapters/flags"
import { Cover } from "@/components/media/cover"
import { m } from "@/paraglide/messages"

const DESKTOP = "@media (width >= 64rem)"
const TABLET = "@media (width >= 40rem)"

export const layoutStyles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gridTemplateAreas: {
      [DESKTOP]: '"cover main groups uploader language time"',
      default: '"cover main time" "cover meta meta"',
    },
    paddingBlock: "0.375rem",
    alignItems: "center",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.chip,
    columnGap: { [DESKTOP]: "0.875rem", default: "0.75rem" },
    display: "grid",
    gridTemplateColumns: {
      [DESKTOP]: "1.6875rem minmax(0, 1fr) minmax(0, 16rem) minmax(0, 9rem) 4.75rem 4rem",
      default: "1.6875rem minmax(0, 1fr) auto",
    },
    rowGap: "0.25rem",
    minHeight: "3.25rem",
    paddingLeft: "0.8125rem",
    paddingRight: "0.875rem",
  },
  rowCover: {
    borderRadius: `calc(${radius.md} - 0.375rem)`,
    display: "block",
    gridColumnEnd: "cover",
    gridColumnStart: "cover",
    gridRowEnd: "cover",
    gridRowStart: "cover",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  rowCoverImage: {
    borderRadius: `calc(${radius.md} - 0.375rem)`,
    width: "1.6875rem",
  },
  inline: {
    gap: "0.625rem",
    alignItems: "baseline",
    display: "flex",
    minWidth: 0,
  },
  rowMain: {
    gridColumnEnd: "main",
    gridColumnStart: "main",
    gridRowEnd: "main",
    gridRowStart: "main",
  },
  title: {
    overflow: "hidden",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    flexShrink: 1,
    fontFamily: font.heading,
    fontSize: "0.9375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
    textOverflow: "ellipsis",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
    whiteSpace: "nowrap",
    minWidth: "3rem",
  },
  untitled: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    fontWeight: 500,
    paddingRight: "0.125em",
  },
  chapterTitle: {
    overflow: "hidden",
    color: colors.mutedForeground,
    display: { [TABLET]: "block", default: "none" },
    flexShrink: 100,
    fontSize: "0.8125rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  rowMeta: {
    gap: "0.75rem",
    alignItems: "center",
    display: { [DESKTOP]: "contents", default: "flex" },
    gridColumnEnd: "meta",
    gridColumnStart: "meta",
    gridRowEnd: "meta",
    gridRowStart: "meta",
    minWidth: 0,
  },
  rowGroups: {
    gridArea: { [DESKTOP]: "groups", default: null },
    flexShrink: 1,
  },
  rowUploader: {
    gridArea: { [DESKTOP]: "uploader", default: null },
    display: { [TABLET]: "flex", default: "none" },
    flexShrink: 2,
  },
  rowLanguage: {
    gridArea: { [DESKTOP]: "language", default: null },
    justifySelf: "start",
    order: { [DESKTOP]: 0, default: -1 },
  },
  rowTime: {
    gridColumnEnd: "time",
    gridColumnStart: "time",
    gridRowEnd: "time",
    gridRowStart: "time",
    textAlign: "right",
  },
  compactFlag: {
    display: "flex",
  },
  compactTime: {
    textAlign: "right",
  },
  grid: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(2, minmax(0, 1fr))",
      "@media (width >= 36rem)": "repeat(3, minmax(0, 1fr))",
      "@media (width >= 52rem)": "repeat(4, minmax(0, 1fr))",
      "@media (width >= 80rem)": "repeat(6, minmax(0, 1fr))",
    },
    rowGap: "1.5rem",
  },
  card: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardCoverLink: {
    borderRadius: radius.lg,
    boxShadow: shadows.raised,
    display: "block",
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    position: "relative",
  },
  cardCover: {
    width: "100%",
  },
  cardLanguage: {
    position: "absolute",
    left: "0.5rem",
    top: "0.5rem",
  },
  cardBody: {
    gap: "0.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardTitle: {
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    display: "-webkit-box",
    fontSize: "0.875rem",
    lineHeight: 1.35,
    whiteSpace: "normal",
  },
  cardMeta: {
    gap: "0.5rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
    minWidth: 0,
  },
  compact: {
    margin: 0,
    padding: 0,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    listStyle: "none",
    overflow: "hidden",
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
  },
  compactRow: {
    paddingInline: "1rem",
    alignItems: "center",
    columnGap: "0.875rem",
    display: "grid",
    gridTemplateColumns: {
      [DESKTOP]: "1.125rem minmax(0, 1fr) minmax(0, 16rem) 4rem",
      default: "1.125rem minmax(0, 1fr) auto",
    },
    borderTopColor: { default: colors.border, ":first-child": "transparent" },
    borderTopStyle: "solid",
    borderTopWidth: 1,
    height: "2.625rem",
  },
  compactGroups: {
    display: { [DESKTOP]: "flex", default: "none" },
  },
  skeletonTitle: {
    height: "0.875rem",
    width: "min(16rem, 60%)",
  },
  skeletonMeta: {
    height: "0.75rem",
    width: "min(10rem, 40%)",
  },
  skeletonTime: {
    justifySelf: "end",
    height: "0.75rem",
    width: "3rem",
  },
  skeletonCardTitle: {
    height: "0.875rem",
    width: "80%",
  },
  skeletonCardMeta: {
    height: "0.75rem",
    width: "50%",
  },
})

export function MediaTitleLink({ chapter, sx }: { chapter: LatestChapter; sx?: Sx }) {
  return (
    <Link
      params={{ mediaId: chapter.mediaId }}
      to="/media/$mediaId"
      {...stylex.props(layoutStyles.title, sx)}
    >
      {chapter.mediaTitle ?? <span sx={layoutStyles.untitled}>{m.media_untitled()}</span>}
    </Link>
  )
}

export function LatestList({ chapters }: { chapters: LatestChapter[] }) {
  return (
    <ul sx={layoutStyles.list}>
      {chapters.map((chapter) => (
        <li key={chapter.id} sx={layoutStyles.row}>
          <Link
            aria-label={chapter.mediaTitle ?? m.media_untitled()}
            params={{ mediaId: chapter.mediaId }}
            tabIndex={-1}
            to="/media/$mediaId"
            {...stylex.props(layoutStyles.rowCover)}
          >
            <Cover src={chapter.mediaCoverUrl} sx={layoutStyles.rowCoverImage} />
          </Link>
          <div sx={[layoutStyles.inline, layoutStyles.rowMain]}>
            <MediaTitleLink chapter={chapter} />
            <ChapterNumber number={chapter.number} />
            {chapter.title === null ? null : (
              <span sx={layoutStyles.chapterTitle}>{chapter.title}</span>
            )}
          </div>
          <div sx={layoutStyles.rowMeta}>
            <ChapterGroups groups={chapter.groups} sx={layoutStyles.rowGroups} />
            <Uploader sx={layoutStyles.rowUploader} uploader={chapter.uploader} />
            <span sx={layoutStyles.rowLanguage}>
              <LanguageChip language={chapter.language} />
            </span>
          </div>
          <TimeAgo date={chapter.createdAt} sx={layoutStyles.rowTime} />
        </li>
      ))}
    </ul>
  )
}
