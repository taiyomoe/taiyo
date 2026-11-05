import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import type { TitleEntity } from "@/features/command-palette/lib/palette-command"
import { getRichTextParagraphs, parseRichText } from "@/components/rich-text/rich-text-document"
import { previewStyles } from "@/features/command-palette/components/preview/preview-styles"
import { mediaQueryOptions } from "@/features/media/api/medias"
import { Cover } from "@/features/media/components/cover"
import {
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_STATUS_BADGES,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  getMediaTags,
  getMediaYears,
  getSynopsis,
} from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"

const MAX_TAGS = 10
const styles = stylex.create({
  cover: {
    flexShrink: 0,
    width: "5.5rem",
  },
  status: {
    alignSelf: "flex-start",
    marginTop: "0.25rem",
  },
  factRow: {
    display: "contents",
  },
})

export function TitlePreview({ title }: { title: TitleEntity }) {
  const { data: media } = useQuery({ ...mediaQueryOptions(title.id), staleTime: 60_000 })
  const meta = [
    MEDIA_TYPE_LABELS[title.type](),
    media === undefined ? title.year : getMediaYears(media),
  ]
    .filter((part) => part !== null)
    .join(" · ")
  const names = (role: "AUTHOR" | "ARTIST") =>
    (media?.staffs ?? [])
      .filter((staff) => staff.role === role)
      .map((staff) => staff.name)
      .join(", ")
  const facts = [
    { term: m.media_info_authors(), value: names("AUTHOR") },
    { term: m.media_info_artists(), value: names("ARTIST") },
    {
      term: m.media_info_demography(),
      value: media === undefined ? "" : MEDIA_DEMOGRAPHY_LABELS[media.demography](),
    },
    {
      term: m.media_info_country(),
      value: media === undefined ? "" : MEDIA_COUNTRY_LABELS[media.countryOfOrigin](),
    },
  ].filter((fact) => fact.value !== "")
  const tags = getMediaTags(media?.tags ?? null).filter((tag) => !tag.isSpoiler)
  const synopsis =
    media === undefined
      ? [title.synopsis]
      : getRichTextParagraphs(parseRichText(getSynopsis(media.synopsis)))

  return (
    <div sx={previewStyles.root}>
      <div sx={previewStyles.header}>
        <Cover src={title.coverUrl} sx={styles.cover} />
        <div sx={previewStyles.headerText}>
          <span sx={previewStyles.heading}>{title.title}</span>
          {title.matchedTitle === null ? null : (
            <span sx={previewStyles.subtle}>
              {m.palette_title_matched({ title: title.matchedTitle })}
            </span>
          )}
          <span sx={previewStyles.subtle}>{meta}</span>
          {media === undefined ? null : (
            <Badge size="sm" sx={styles.status} variant={MEDIA_STATUS_BADGES[media.status]}>
              {MEDIA_STATUS_LABELS[media.status]()}
            </Badge>
          )}
        </div>
      </div>
      {media === undefined ? (
        <div sx={previewStyles.section}>
          <Skeleton sx={previewStyles.line} />
          <Skeleton sx={[previewStyles.line, previewStyles.lineShort]} />
        </div>
      ) : (
        facts.length > 0 && (
          <dl sx={previewStyles.facts}>
            {facts.map((fact) => (
              <div key={fact.term} sx={styles.factRow}>
                <dt sx={previewStyles.factLabel}>{fact.term}</dt>
                <dd sx={previewStyles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )
      )}
      {tags.length === 0 ? null : (
        <div sx={previewStyles.section}>
          <span sx={previewStyles.label}>{m.media_info_tags()}</span>
          <div sx={previewStyles.chips}>
            {tags.slice(0, MAX_TAGS).map((tag) => (
              <Badge key={tag.key} size="sm" variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div sx={previewStyles.section}>
        <span sx={previewStyles.label}>{m.media_info_synopsis()}</span>
        {synopsis.length === 0 || synopsis[0] === "" ? (
          <p sx={previewStyles.subtle}>{m.media_info_no_synopsis()}</p>
        ) : (
          synopsis.map((paragraph) => (
            <p key={paragraph} sx={previewStyles.body}>
              {paragraph}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
