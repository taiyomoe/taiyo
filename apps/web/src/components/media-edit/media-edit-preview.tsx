import type { Language, MediaEditField } from "@taiyomoe/db/constants"
import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { MediaEditDraft } from "@/components/media-edit/media-edit-model"
import { getLanguageName, LanguageFlag } from "@/components/chapters/flags"
import { getTagName, STAFF_ROLE_LABELS } from "@/components/media-edit/media-edit-fields"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_LINKS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/components/media/media-labels"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    minWidth: 0,
  },
  text: {
    margin: 0,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  synopsis: {
    margin: 0,
    overflow: "hidden",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 8,
    color: colors.foreground,
    display: "-webkit-box",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  language: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.8125rem",
    marginBottom: "0.25rem",
  },
  chips: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    borderRadius: radius.full,
    paddingBlock: "0.125rem",
    paddingInline: "0.625rem",
    backgroundColor: colors.muted,
    fontSize: "0.8125rem",
  },
  spoiler: {
    color: colors.warning,
  },
  linkKey: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontSize: "0.8125rem",
    minWidth: "8rem",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontStyle: "italic",
  },
})
const Empty = () => <p sx={styles.empty}>{m.media_edit_preview_empty()}</p>
const formatDate = (value: string | null) => (value === null ? null : value.slice(0, 10))

function SynopsisPreview({ synopsis }: { synopsis: MediaEditDraft["synopsis"] }) {
  const entries = Object.entries(synopsis).filter(
    (entry): entry is [Language, string] => entry[1] !== undefined && entry[1].trim() !== "",
  )

  if (entries.length === 0) {
    return <Empty />
  }

  return (
    <ul sx={styles.list}>
      {entries.map(([language, text]) => (
        <li key={language}>
          <div sx={styles.language}>
            <LanguageFlag language={language} />
            {getLanguageName(language)}
          </div>
          <p sx={styles.synopsis}>{text}</p>
        </li>
      ))}
    </ul>
  )
}

function Text({ value }: { value: string | null }) {
  return value === null ? <Empty /> : <p sx={styles.text}>{value}</p>
}

const PREVIEWS: Record<MediaEditField, (draft: MediaEditDraft) => ReactNode> = {
  titles: (draft) =>
    draft.titles.length === 0 ? (
      <Empty />
    ) : (
      <ul sx={styles.list}>
        {draft.titles.map((title) => (
          <li key={`${title.language}:${title.title}`} sx={styles.row}>
            <LanguageFlag language={title.language} />
            <span sx={styles.text}>{title.title}</span>
            {title.isMainTitle ? (
              <Badge variant="warning">{m.media_edit_title_main()}</Badge>
            ) : null}
            {title.isAcronym ? (
              <Badge variant="secondary">{m.media_edit_title_acronym()}</Badge>
            ) : null}
          </li>
        ))}
      </ul>
    ),
  synopsis: (draft) => <SynopsisPreview synopsis={draft.synopsis} />,
  type: (draft) => <Text value={MEDIA_TYPE_LABELS[draft.type]()} />,
  status: (draft) => <Text value={MEDIA_STATUS_LABELS[draft.status]()} />,
  source: (draft) => <Text value={MEDIA_SOURCE_LABELS[draft.source]()} />,
  demography: (draft) => <Text value={MEDIA_DEMOGRAPHY_LABELS[draft.demography]()} />,
  countryOfOrigin: (draft) => <Text value={MEDIA_COUNTRY_LABELS[draft.countryOfOrigin]()} />,
  contentRating: (draft) => <Text value={CONTENT_RATING_LABELS[draft.contentRating]()} />,
  startDate: (draft) => <Text value={formatDate(draft.startDate)} />,
  endDate: (draft) => <Text value={formatDate(draft.endDate)} />,
  tags: (draft) =>
    draft.tags.length === 0 ? (
      <Empty />
    ) : (
      <ul sx={styles.chips}>
        {draft.tags.map((tag) => (
          <li key={tag.key} sx={[styles.chip, tag.isSpoiler && styles.spoiler]}>
            {getTagName(tag.key)}
            {tag.isSpoiler ? ` · ${m.media_edit_tag_spoiler()}` : ""}
          </li>
        ))}
      </ul>
    ),
  links: (draft) => {
    const links = Object.entries(draft.links).filter(([, value]) => value !== undefined)

    return links.length === 0 ? (
      <Empty />
    ) : (
      <ul sx={styles.list}>
        {links.map(([key, value]) => (
          <li key={key} sx={styles.row}>
            <span sx={styles.linkKey}>{MEDIA_LINKS[key]?.label ?? key}</span>
            <span sx={styles.text}>{String(value)}</span>
          </li>
        ))}
      </ul>
    )
  },
  staffs: (draft) =>
    draft.staffs.length === 0 ? (
      <Empty />
    ) : (
      <ul sx={styles.list}>
        {draft.staffs.map((staff) => (
          <li key={`${staff.role}:${staff.staffId}`} sx={styles.row}>
            <span sx={styles.text}>{staff.name}</span>
            <Badge variant="secondary">{STAFF_ROLE_LABELS[staff.role]()}</Badge>
          </li>
        ))}
      </ul>
    ),
}

export function FieldPreview({ field, draft }: { field: MediaEditField; draft: MediaEditDraft }) {
  return PREVIEWS[field](draft)
}
