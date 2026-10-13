import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { colors, font, motion, radius, shadows, text } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { FeaturedMedia } from "@/lib/queries/medias"
import { Cover, CoverSkeleton } from "@/components/media/cover"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const MAX_GENRES = 8
const styles = stylex.create({
  slide: {
    overflow: "hidden",
    flexBasis: "100%",
    flexGrow: 0,
    flexShrink: 0,
    position: "relative",
    userSelect: "none",
    minWidth: 0,
  },
  backdrop: {
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
  },
  backdropImage: {
    filter: "blur(4px)",
    objectFit: "cover",
    objectPosition: "50% 30%",
    position: "absolute",
    transform: "scale(1.05)",
    height: "150%",
    left: 0,
    top: 0,
    width: "100%",
  },
  shade: {
    inset: 0,
    backgroundImage: `linear-gradient(to bottom, color-mix(in srgb, ${colors.background} 60%, transparent), ${colors.background})`,
    position: "absolute",
  },
  content: {
    gap: { default: "1.25rem", "@media (width >= 48rem)": "2.5rem" },
    paddingInline: { default: "1.25rem", "@media (width >= 48rem)": "2.5rem" },
    display: "flex",
    position: "relative",
    paddingBottom: { default: "2.25rem", "@media (width >= 48rem)": "2.5rem" },
    paddingTop: {
      default: "calc(var(--navbar-height) + 1.25rem)",
      "@media (width >= 48rem) and (width < 50rem)": "calc(var(--navbar-height) + 2.5rem)",
      "@media (width >= 50rem)": "2.5rem",
    },
  },
  coverLink: {
    borderRadius: radius.lg,
    boxShadow: shadows.overlay,
    display: "block",
    flexShrink: 0,
    outlineColor: colors.ring,
    outlineOffset: 3,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
  },
  cover: {
    height: { default: "10.5rem", "@media (width >= 48rem)": "16.5rem" },
  },
  details: {
    gap: { default: "0.375rem", "@media (width >= 48rem)": "0.75rem" },
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: "52rem",
    minWidth: 0,
  },
  title: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    color: {
      default: colors.foreground,
      ":has(> a:hover)": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "-webkit-box",
    flexShrink: 0,
    fontFamily: font.heading,
    fontSize: { default: text.xl, "@media (width >= 48rem)": "2.5rem" },
    fontWeight: font.weightBold,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    overflowWrap: "anywhere",
    transitionDuration: "200ms",
    transitionProperty: "color",
    transitionTimingFunction: motion.easeOut,
  },
  titleLink: {
    borderRadius: radius.sm,
    color: "inherit",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    textDecorationLine: "none",
  },
  authors: {
    margin: 0,
    overflow: "hidden",
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    flexShrink: 0,
    fontSize: { default: "0.875rem", "@media (width >= 48rem)": text.base },
    fontWeight: 600,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  genres: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    overflow: "hidden",
    display: { default: "none", "@media (width >= 48rem)": "flex" },
    flexShrink: 0,
    flexWrap: "wrap",
    maxHeight: "1.5rem",
  },
  genre: {
    borderRadius: radius.full,
    overflow: "hidden",
    paddingBlock: "0.25rem",
    paddingInline: "0.625rem",
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 10%, transparent)`,
    color: colors.foreground,
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    lineHeight: "1rem",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },
  synopsisBox: {
    overflow: "hidden",
    containerType: "size",
    flexBasis: 0,
    flexGrow: 1,
    fontSize: { default: "0.875rem", "@media (width >= 48rem)": text.lg },
    lineHeight: 1.6,
    minHeight: 0,
  },
  synopsis: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: {
      default: 1,
      "@container (height >= 3.2em)": 2,
      "@container (height >= 4.8em)": 3,
      "@container (height >= 6.4em)": 4,
      "@container (height >= 8em)": 5,
      "@container (height >= 9.6em)": 6,
    },
    color: `color-mix(in srgb, ${colors.foreground} 80%, transparent)`,
    display: "-webkit-box",
    overflowWrap: "anywhere",
  },
  skeletonLines: {
    gap: { default: "0.5rem", "@media (width >= 48rem)": "0.75rem" },
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: "36rem",
  },
  skeletonTitle: {
    height: { default: "1.5rem", "@media (width >= 48rem)": "2.5rem" },
    width: "70%",
  },
  skeletonAuthors: {
    height: "1rem",
    width: "40%",
  },
  skeletonLine: {
    height: "0.875rem",
    width: "100%",
  },
  skeletonLineShort: {
    height: "0.875rem",
    width: "60%",
  },
})
const toPlainText = (markdown: string) =>
  (markdown.split(/\n\s*(?:-{3,}|_{3,}|\*{3,})\s*\n/)[0] ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>~]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
const getSynopsis = (synopsis: FeaturedMedia["synopsis"]) => {
  const localized = synopsis[getLocale()] ?? synopsis.en ?? Object.values(synopsis)[0]

  return localized === undefined ? "" : toPlainText(localized)
}
const isTagKey = (key: string): key is keyof typeof config.tags => key in config.tags
const getGenres = (tags: string[]) =>
  tags
    .filter(isTagKey)
    .map((key) => config.tags[key])
    .filter((tag) => tag.category === "Genre")
    .slice(0, MAX_GENRES)
    .map((tag) => tag.name.en)

type FeaturedSlideProps = {
  media: FeaturedMedia
  index: number
  total: number
}

export function FeaturedSlide({ media, index, total }: FeaturedSlideProps) {
  const backdropUrl = media.bannerUrl ?? media.coverUrl
  const synopsis = getSynopsis(media.synopsis)
  const genres = getGenres(media.tags)
  const eager = index === 0

  return (
    <div
      aria-label={m.home_featured_slide({ index: index + 1, total })}
      aria-roledescription="slide"
      role="group"
      sx={styles.slide}
    >
      <div aria-hidden sx={styles.backdrop}>
        {backdropUrl === null ? null : <Backdrop eager={eager} src={backdropUrl} />}
        <div sx={styles.shade} />
      </div>
      <div sx={styles.content}>
        <Link
          aria-label={media.title ?? undefined}
          draggable={false}
          params={{ mediaId: media.id }}
          {...stylex.props(styles.coverLink)}
          to="/media/$mediaId"
        >
          <Cover priority={eager ? "high" : "low"} src={media.coverUrl} sx={styles.cover} />
        </Link>
        <div sx={styles.details}>
          <h2 sx={styles.title}>
            <Link
              draggable={false}
              params={{ mediaId: media.id }}
              {...stylex.props(styles.titleLink)}
              to="/media/$mediaId"
            >
              {media.title}
            </Link>
          </h2>
          {media.authors.length > 0 ? <p sx={styles.authors}>{media.authors.join(", ")}</p> : null}
          {genres.length > 0 ? (
            <ul sx={styles.genres}>
              {genres.map((genre) => (
                <li key={genre} sx={styles.genre}>
                  {genre}
                </li>
              ))}
            </ul>
          ) : null}
          {synopsis === "" ? null : (
            <div sx={styles.synopsisBox}>
              <p sx={styles.synopsis}>{synopsis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Backdrop({ src, eager }: { src: string; eager: boolean }) {
  return (
    <img
      alt=""
      decoding={eager ? "sync" : "async"}
      draggable={false}
      fetchPriority={eager ? "high" : "low"}
      src={src}
      sx={styles.backdropImage}
    />
  )
}

export function FeaturedSlideSkeleton() {
  return (
    <div aria-hidden sx={styles.slide}>
      <div sx={styles.backdrop}>
        <div sx={styles.shade} />
      </div>
      <div sx={styles.content}>
        <CoverSkeleton sx={styles.cover} />
        <div sx={styles.skeletonLines}>
          <Skeleton sx={styles.skeletonTitle} />
          <Skeleton sx={styles.skeletonAuthors} />
          <Skeleton sx={styles.skeletonLine} />
          <Skeleton sx={styles.skeletonLine} />
          <Skeleton sx={styles.skeletonLineShort} />
        </div>
      </div>
    </div>
  )
}
