import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Media } from "@/features/media/api/medias"
import { CountryFlag } from "@/components/flags/flags"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
  getMediaYears,
} from "@/features/media/lib/media-labels"
import { ContentRatingLabel } from "@/features/settings/components/content-rating-label"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
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
})

export function MediaDetails({ media }: { media: Media }) {
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
