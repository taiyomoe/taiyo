import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Close, Globe, Image, Link as LinkIcon } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { ChapterRowMeta } from "@/features/uploads/components/upload/chapter-row-meta"
import { isWebUrl, resolveLink } from "@/features/uploads/lib/chapter-batch/links"
import {
  linkNumber,
  parseNumber,
  type RowIssues,
  type UploadRow,
} from "@/features/uploads/lib/chapter-batch/upload-rows"
import { m } from "@/paraglide/messages"

type ChapterTableRowProps = {
  row: UploadRow
  issues: RowIssues
  releaseAt: Date | null
  template: string
  attempted: boolean
  onChange: (patch: Partial<UploadRow>) => void
  onEditPages: () => void
  onRemove: () => void
}

const styles = stylex.create({
  row: {
    gap: "0.375rem",
    paddingBlock: "0.75rem",
    display: "flex",
    flexDirection: "column",
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: 1,
  },
  rowFields: {
    gap: "0.75rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: {
      default: "6rem 5.5rem minmax(0, 1fr)",
      [breakpoints.md]: "6rem 5.5rem minmax(0, 1fr) 6rem 2rem 2rem",
    },
  },
  linkOnly: {
    gap: "0.375rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "inline-flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    justifyContent: "center",
    whiteSpace: "nowrap",
  },
})

export function ChapterTableRow({
  row,
  issues,
  releaseAt,
  template,
  attempted,
  onChange,
  onEditPages,
  onRemove,
}: ChapterTableRowProps) {
  const fromTemplate = resolveLink("", template, linkNumber(row))
  const link = resolveLink(row.link, template, linkNumber(row))
  const linkVisible = row.source === null || row.linkOpen || row.link !== ""
  const linkInvalid =
    (row.link.trim() !== "" && !isWebUrl(row.link.trim())) ||
    (attempted && row.source === null && link === null)

  return (
    <li sx={styles.row}>
      <div sx={styles.rowFields}>
        <Field invalid={attempted && parseNumber(row.number) === null}>
          <Input
            aria-label={m.upload_number()}
            inputMode="decimal"
            onChange={(event) => {
              onChange({ number: event.target.value })
            }}
            size="sm"
            value={row.number}
          />
        </Field>
        <Input
          aria-label={m.upload_volume()}
          maxLength={config.input.maxVolumeLength}
          onChange={(event) => {
            onChange({ volume: event.target.value })
          }}
          size="sm"
          value={row.volume}
        />
        <Input
          aria-label={m.upload_chapter_title()}
          maxLength={config.input.maxChapterTitleLength}
          onChange={(event) => {
            onChange({ title: event.target.value })
          }}
          size="sm"
          value={row.title}
        />
        {row.source === null ? (
          <span sx={styles.linkOnly}>
            <Globe size={14} />
            {m.upload_link_only()}
          </span>
        ) : (
          <Button
            aria-label={m.upload_pages_button({ number: row.number || "?" })}
            onClick={onEditPages}
            size="sm"
            variant="outline"
          >
            <Image />
            {row.pageKeys.length}
          </Button>
        )}
        {row.source === null ? (
          <span />
        ) : (
          <Button
            aria-label={m.upload_row_link_toggle()}
            aria-pressed={linkVisible}
            onClick={() => {
              onChange(linkVisible ? { link: "", linkOpen: false } : { linkOpen: true })
            }}
            size="icon-sm"
            variant="ghost"
          >
            <LinkIcon />
          </Button>
        )}
        <Button
          aria-label={m.upload_remove_chapter()}
          onClick={onRemove}
          size="icon-sm"
          variant="ghost"
        >
          <Close />
        </Button>
      </div>
      {linkVisible ? (
        <Field invalid={linkInvalid}>
          <Input
            aria-label={m.upload_row_link({ number: row.number || "?" })}
            maxLength={config.input.maxUrlLength}
            onChange={(event) => {
              onChange({ link: event.target.value })
            }}
            placeholder={fromTemplate ?? "https://"}
            size="sm"
            type="url"
            value={row.link}
          />
        </Field>
      ) : null}
      <ChapterRowMeta
        attempted={attempted}
        issues={issues}
        link={link}
        linkVisible={linkVisible}
        releaseAt={releaseAt}
        source={row.source}
      />
    </li>
  )
}
