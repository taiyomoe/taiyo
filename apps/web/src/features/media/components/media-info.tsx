import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { ArrowRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { Media } from "@/features/media/api/medias"
import { CountryFlag, LanguageFlag, getLanguageName } from "@/components/flags/flags"
import { sceneFont } from "@/components/scene/scene.stylex"
import {
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  getAltTitles,
  getMediaLinks,
  getMediaTags,
  getMediaYears,
  getSynopsis,
} from "@/features/media/lib/media-labels"
import { ContentRatingLabel } from "@/features/settings/components/content-rating-label"
import { m } from "@/paraglide/messages"

const WIDE = "@media (width >= 72rem)"
const SYNOPSIS_PREVIEW_LENGTH = 700
const CONTENT_RATING_LABELS: Record<Media["contentRating"], () => string> = {
  NORMAL: m.content_rating_normal,
  SUGGESTIVE: m.content_rating_suggestive,
  NSFW: m.content_rating_nsfw,
  NSFL: m.content_rating_nsfl,
}
const styles = stylex.create({
  root: {
    gap: "2rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: { [WIDE]: "minmax(0, 1fr) 20rem", default: "minmax(0, 1fr)" },
  },
  main: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  section: {
    gap: "0.875rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: sceneFont.display,
    fontSize: "1.375rem",
    fontWeight: font.weightBold,
    letterSpacing: "-0.01em",
  },
  synopsis: {
    gap: "0.875rem",
    color: `color-mix(in srgb, ${colors.foreground} 85%, transparent)`,
    display: "flex",
    flexDirection: "column",
    fontSize: "1rem",
    lineHeight: 1.7,
    maxWidth: "48rem",
  },
  synopsisCollapsed: {
    overflow: "hidden",
    maskImage: "linear-gradient(to bottom, black 55%, transparent)",
    maxHeight: "13.6em",
  },
  paragraph: {
    margin: 0,
    overflowWrap: "anywhere",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
  tags: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  tag: {
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBlock: "0.3125rem",
    paddingInline: "0.75rem",
    backgroundColor: colors.chip,
    boxShadow: shadows.chip,
    color: colors.foreground,
    display: "block",
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  genre: {
    fontWeight: 600,
  },
  spoiler: {
    borderStyle: "dashed",
    color: colors.mutedForeground,
  },
  card: {
    margin: 0,
    padding: "1.25rem",
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundClip: "padding-box",
    backgroundColor: colors.card,
    boxShadow: shadows.raised,
    columnGap: "1rem",
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr)",
    rowGap: "0.875rem",
  },
  term: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  value: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
    fontWeight: 600,
    justifyContent: "flex-end",
    textAlign: "end",
  },
  titles: {
    margin: 0,
    padding: 0,
    gap: "0.625rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    gap: "0.625rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.9375rem",
    minWidth: 0,
  },
  titleText: {
    overflowWrap: "anywhere",
  },
  titleFlag: {
    flexShrink: 0,
  },
  links: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
})

export function MediaInfo({ media }: { media: Media }) {
  const synopsis = getSynopsis(media.synopsis)
  const tags = getMediaTags(media.tags)
  const altTitles = getAltTitles(media.titles)
  const links = getMediaLinks(media.links)

  return (
    <div sx={styles.root}>
      <div sx={styles.main}>
        <Section title={m.media_info_synopsis()}>
          {synopsis.length === 0 ? (
            <p sx={styles.muted}>{m.media_info_no_synopsis()}</p>
          ) : (
            <Synopsis paragraphs={synopsis} />
          )}
        </Section>
        {tags.length === 0 ? null : (
          <Section title={m.media_info_tags()}>
            <TagList tags={tags} />
          </Section>
        )}
        {altTitles.length === 0 ? null : (
          <Section title={m.media_info_titles()}>
            <ul sx={styles.titles}>
              {altTitles.map((title) => (
                <li key={title.id} sx={styles.title}>
                  <span sx={styles.titleFlag} title={getLanguageName(title.language)}>
                    <LanguageFlag language={title.language} />
                  </span>
                  <span sx={styles.titleText}>{title.title}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}
        {links.length === 0 ? null : (
          <Section title={m.media_info_links()}>
            <div sx={styles.links}>
              {links.map((link) => (
                <Button
                  key={link.key}
                  render={<a href={link.href} rel="noreferrer noopener" target="_blank" />}
                  size="sm"
                  variant="outline"
                >
                  {link.label}
                  <ArrowRight />
                </Button>
              ))}
            </div>
          </Section>
        )}
      </div>
      <MediaDetails media={media} />
    </div>
  )
}

function Synopsis({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const long = paragraphs.join(" ").length > SYNOPSIS_PREVIEW_LENGTH

  return (
    <>
      <div sx={[styles.synopsis, long && !expanded && styles.synopsisCollapsed]}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} sx={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
      {long ? (
        <div>
          <Button
            onClick={() => {
              setExpanded(!expanded)
            }}
            size="sm"
            variant="ghost"
          >
            {expanded ? m.media_info_show_less() : m.media_info_show_more()}
          </Button>
        </div>
      ) : null}
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section sx={styles.section}>
      <h3 sx={styles.heading}>{title}</h3>
      {children}
    </section>
  )
}

function TagList({ tags }: { tags: ReturnType<typeof getMediaTags> }) {
  const [showSpoilers, setShowSpoilers] = useState(false)
  const spoilers = tags.filter((tag) => tag.isSpoiler).length
  const visible = tags
    .filter((tag) => showSpoilers || !tag.isSpoiler)
    .sort((a, b) => Number(b.isGenre) - Number(a.isGenre))

  return (
    <ul sx={styles.tags}>
      {visible.map((tag) => (
        <li key={tag.key}>
          <span sx={[styles.tag, tag.isGenre && styles.genre, tag.isSpoiler && styles.spoiler]}>
            {tag.name}
          </span>
        </li>
      ))}
      {spoilers === 0 ? null : (
        <li>
          <Button
            onClick={() => {
              setShowSpoilers(!showSpoilers)
            }}
            size="xs"
            variant="ghost"
          >
            {showSpoilers
              ? m.media_info_hide_spoilers()
              : m.media_info_show_spoilers({ count: spoilers })}
          </Button>
        </li>
      )}
    </ul>
  )
}

function MediaDetails({ media }: { media: Media }) {
  const years = getMediaYears(media)
  const authors = media.staffs.filter((staff) => staff.role === "AUTHOR")
  const artists = media.staffs.filter((staff) => staff.role === "ARTIST")

  return (
    <dl sx={styles.card}>
      <Detail term={m.media_info_type()}>{MEDIA_TYPE_LABELS[media.type]()}</Detail>
      <Detail term={m.media_info_status()}>{MEDIA_STATUS_LABELS[media.status]()}</Detail>
      {years === null ? null : <Detail term={m.media_info_published()}>{years}</Detail>}
      {authors.length === 0 ? null : (
        <Detail term={m.media_info_authors()}>
          {authors.map((staff) => staff.name).join(", ")}
        </Detail>
      )}
      {artists.length === 0 ? null : (
        <Detail term={m.media_info_artists()}>
          {artists.map((staff) => staff.name).join(", ")}
        </Detail>
      )}
      <Detail term={m.media_info_demography()}>
        {MEDIA_DEMOGRAPHY_LABELS[media.demography]()}
      </Detail>
      <Detail term={m.media_info_source()}>{MEDIA_SOURCE_LABELS[media.source]()}</Detail>
      <Detail term={m.media_info_country()}>
        <CountryFlag country={media.countryOfOrigin} />
        {MEDIA_COUNTRY_LABELS[media.countryOfOrigin]()}
      </Detail>
      <Detail term={m.media_info_content_rating()}>
        <ContentRatingLabel
          label={CONTENT_RATING_LABELS[media.contentRating]()}
          rating={media.contentRating}
        />
      </Detail>
    </dl>
  )
}

function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <dt sx={styles.term}>{term}</dt>
      <dd sx={styles.value}>{children}</dd>
    </>
  )
}
