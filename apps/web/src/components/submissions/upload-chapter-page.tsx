import type { Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import {
  CalendarClock,
  CheckCircle,
  Close,
  CloudUpload,
  Globe,
  Image,
  Info,
  Link as LinkIcon,
  Plus,
  Upload,
} from "@taiyomoe/ui/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@taiyomoe/ui/components/ui/alert"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { Session } from "@/lib/queries/session"
import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { formatDateTime } from "@/components/fields/date-time-picker"
import { ChapterPagesDialog } from "@/components/submissions/chapter-pages-dialog"
import {
  type GroupOption,
  GroupPicker,
  LanguagePicker,
  type MediaOption,
  MediaPicker,
} from "@/components/submissions/pickers"
import { ReleaseField } from "@/components/submissions/release-field"
import { hostOf, isWebUrl, NUMBER_TOKEN, resolveLink } from "@/lib/chapter-batch/links"
import { parseChapterName } from "@/lib/chapter-batch/parse-chapter-name"
import { DEFAULT_RELEASE, planRelease, type ReleaseSettings } from "@/lib/chapter-batch/release"
import {
  type ChapterSource,
  type DroppedFile,
  filesFromDrop,
  filesFromInput,
  readChapterSources,
} from "@/lib/chapter-batch/sources"
import { chapterNumbersQueryKey, fetchChapterNumbers } from "@/lib/chapter-batch/upload"
import { uploadStore } from "@/lib/chapter-batch/upload-store"
import { usePermissions } from "@/lib/permissions"
import { pendingSubmissionsCountQueryOptions } from "@/lib/queries/submissions"
import { useNow } from "@/lib/use-now"
import { m } from "@/paraglide/messages"

type Row = {
  key: string
  source: ChapterSource | null
  number: string
  volume: string
  title: string
  pageKeys: string[]
  link: string
  linkOpen: boolean
}

const styles = stylex.create({
  layout: {
    gap: "1.5rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (width >= 64rem)": "22rem minmax(0, 1fr)",
    },
  },
  column: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  card: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  cardHeader: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  cardTitle: {
    margin: 0,
    flexGrow: 1,
    fontSize: "1rem",
    fontWeight: 600,
  },
  count: {
    borderRadius: radius.full,
    paddingInline: "0.5rem",
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    lineHeight: "1.25rem",
    marginInlineStart: "0.5rem",
  },
  drop: {
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: "0.75rem",
    paddingBlock: "2.5rem",
    paddingInline: "1.5rem",
    alignItems: "center",
    backgroundColor: colors.card,
    color: colors.mutedForeground,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    transitionDuration: motion.enter,
    transitionProperty: "border-color, background-color",
  },
  dropActive: {
    borderColor: colors.primary,
    backgroundColor: `color-mix(in srgb, ${colors.primary} 6%, ${colors.card})`,
  },
  dropIcon: {
    color: colors.mutedForeground,
    height: "2rem",
    width: "2rem",
  },
  dropTitle: {
    color: colors.foreground,
    fontSize: "1.0625rem",
    fontWeight: 600,
  },
  dropHint: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    maxWidth: "34rem",
  },
  dropActions: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "0.25rem",
  },
  hiddenInput: {
    display: "none",
  },
  reading: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  note: {
    margin: 0,
    color: colors.warning,
    fontSize: "0.875rem",
    overflowWrap: "anywhere",
  },
  table: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  tableHead: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: { default: "none", "@media (width >= 48rem)": "grid" },
    fontSize: "0.75rem",
    fontWeight: 600,
    gridTemplateColumns: "6rem 5.5rem minmax(0, 1fr) 6rem 2rem 2rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    paddingBottom: "0.5rem",
  },
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
      "@media (width >= 48rem)": "6rem 5.5rem minmax(0, 1fr) 6rem 2rem 2rem",
    },
  },
  rowMeta: {
    gap: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.8125rem",
  },
  source: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "24rem",
  },
  metaItem: {
    gap: "0.375rem",
    alignItems: "center",
    display: "inline-flex",
    minWidth: 0,
  },
  metaIcon: {
    flexShrink: 0,
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
  warning: {
    color: colors.warning,
  },
  error: {
    color: colors.destructive,
  },
  footer: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.75rem",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundColor: `color-mix(in srgb, ${colors.card} 92%, transparent)`,
    boxShadow: shadows.overlay,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingInlineStart: "1.25rem",
    position: "sticky",
    zIndex: 10,
    bottom: "1rem",
  },
  footerText: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  footerError: {
    color: colors.destructive,
    fontSize: "0.875rem",
  },
})
const PUBLISH_TITLES: Record<ReleaseSettings["mode"], () => string> = {
  now: m.upload_will_publish,
  date: m.uploads_state_scheduled,
  delay: m.uploads_state_scheduled,
}
const publishDescription = (scheduled: boolean) =>
  scheduled ? m.upload_will_schedule_description() : m.upload_will_publish_description()
const reviewDescription = (scheduled: boolean) =>
  scheduled ? m.upload_will_review_scheduled_description() : m.upload_will_review_description()
const parseNumber = (value: string) => {
  const number = Number(value.replace(",", "."))

  return value.trim() === "" || !Number.isFinite(number) || number < 0 ? null : number
}
const byNumber = (a: Row, b: Row) =>
  (parseNumber(a.number) ?? Number.POSITIVE_INFINITY) -
    (parseNumber(b.number) ?? Number.POSITIVE_INFINITY) ||
  (a.source?.name ?? "").localeCompare(b.source?.name ?? "", undefined, { numeric: true })
const linkNumber = (row: Row) => String(parseNumber(row.number) ?? row.number)
const toRow = (source: ChapterSource): Row => {
  const parsed = parseChapterName(source.path)

  return {
    key: source.key,
    source,
    number: parsed.number === null ? "" : String(parsed.number),
    volume: parsed.volume ?? "",
    title: parsed.title ?? "",
    pageKeys: source.pages.map((page) => page.key),
    link: "",
    linkOpen: false,
  }
}

type RowIssues = { errors: string[]; warnings: string[] }

const getIssues = (
  row: Row,
  counts: Map<number, number>,
  existing: ReadonlySet<number>,
  template: string,
) => {
  const issues: RowIssues = { errors: [], warnings: [] }
  const number = parseNumber(row.number)
  const link = resolveLink(row.link, template, linkNumber(row))

  if (number === null) {
    issues.errors.push(m.upload_warning_number())
  } else if ((counts.get(number) ?? 0) > 1) {
    issues.warnings.push(m.upload_warning_duplicate())
  } else if (existing.has(number)) {
    issues.warnings.push(m.upload_warning_exists())
  }

  if (row.source === null && link === null) {
    issues.errors.push(m.upload_warning_link_required())
  } else if (row.link.trim() !== "" && !isWebUrl(row.link.trim())) {
    issues.errors.push(m.upload_link_invalid())
  }

  if (row.source === null) {
    return issues
  }

  const sizes = new Map(row.source.pages.map((page) => [page.key, page.size]))
  const oversized = row.pageKeys.filter(
    (key) => (sizes.get(key) ?? 0) > config.images.maxChapterPageSizeBytes,
  ).length

  if (row.pageKeys.length === 0) {
    issues.errors.push(m.upload_warning_no_pages())
  }

  if (row.pageKeys.length > config.images.maxChapterPages) {
    issues.errors.push(m.upload_warning_too_many({ max: config.images.maxChapterPages }))
  }

  if (oversized > 0) {
    issues.errors.push(m.upload_warning_too_large({ count: oversized }))
  }

  return issues
}

function DropZone({
  disabled,
  reading,
  onFiles,
  onAddLinkOnly,
}: {
  disabled: boolean
  reading: boolean
  onFiles: (files: Promise<DroppedFile[]>) => void
  onAddLinkOnly: () => void
}) {
  const [over, setOver] = useState(false)

  return (
    <div
      onDragLeave={() => {
        setOver(false)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setOver(true)
      }}
      onDrop={(event) => {
        event.preventDefault()
        setOver(false)

        if (!disabled) {
          onFiles(filesFromDrop(event.dataTransfer.items))
        }
      }}
      sx={[styles.drop, over && styles.dropActive]}
    >
      <CloudUpload {...stylex.props(styles.dropIcon)} />
      <span sx={styles.dropTitle}>{m.upload_drop_title()}</span>
      <span sx={styles.dropHint}>{m.upload_drop_hint()}</span>
      {reading ? (
        <span sx={styles.reading}>
          <Spinner />
          {m.upload_reading()}
        </span>
      ) : (
        <div sx={styles.dropActions}>
          <Button disabled={disabled} render={<label />} variant="outline">
            {m.upload_choose_folder()}
            <input
              disabled={disabled}
              multiple
              onChange={(event) => {
                onFiles(Promise.resolve(filesFromInput(event.target.files)))
                event.target.value = ""
              }}
              ref={(input) => {
                input?.setAttribute("webkitdirectory", "")
              }}
              sx={styles.hiddenInput}
              type="file"
            />
          </Button>
          <Button disabled={disabled} render={<label />} variant="outline">
            {m.upload_choose_files()}
            <input
              accept="image/jpeg,image/png,image/webp,image/gif,.zip,.cbz"
              disabled={disabled}
              multiple
              onChange={(event) => {
                onFiles(Promise.resolve(filesFromInput(event.target.files)))
                event.target.value = ""
              }}
              sx={styles.hiddenInput}
              type="file"
            />
          </Button>
          <Button disabled={disabled} onClick={onAddLinkOnly} variant="ghost">
            <Plus />
            {m.upload_add_link_only()}
          </Button>
        </div>
      )}
    </div>
  )
}

function ChapterRow({
  row,
  issues,
  showErrors,
  template,
  releaseAt,
  onChange,
  onRemove,
  onOpenPages,
}: {
  row: Row
  issues: RowIssues
  showErrors: boolean
  template: string
  releaseAt: Date | null
  onChange: (patch: Partial<Row>) => void
  onRemove: () => void
  onOpenPages: () => void
}) {
  const fromTemplate = resolveLink("", template, linkNumber(row))
  const link = resolveLink(row.link, template, linkNumber(row))
  const linkVisible = row.source === null || row.linkOpen || row.link !== ""
  const linkInvalid =
    (row.link.trim() !== "" && !isWebUrl(row.link.trim())) ||
    (showErrors && row.source === null && link === null)

  return (
    <li sx={styles.row}>
      <div sx={styles.rowFields}>
        <Field invalid={showErrors && parseNumber(row.number) === null}>
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
            onClick={onOpenPages}
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
      <div sx={styles.rowMeta}>
        <span sx={styles.source} title={row.source?.name}>
          {row.source === null ? m.upload_link_only_source() : row.source.name || "—"}
        </span>
        {link !== null && !linkVisible && isWebUrl(link) ? (
          <span sx={[styles.metaItem, styles.source]} title={link}>
            <LinkIcon size={12} {...stylex.props(styles.metaIcon)} />
            {hostOf(link)}
          </span>
        ) : null}
        {releaseAt === null ? null : (
          <span sx={styles.metaItem}>
            <CalendarClock size={12} {...stylex.props(styles.metaIcon)} />
            {m.chapter_goes_live({ time: formatDateTime(releaseAt) })}
          </span>
        )}
        {issues.warnings.map((warning) => (
          <span key={warning} sx={styles.warning}>
            {warning}
          </span>
        ))}
        {showErrors
          ? issues.errors.map((error) => (
              <span key={error} sx={styles.error}>
                {error}
              </span>
            ))
          : null}
      </div>
    </li>
  )
}

export function UploadChapterPage({ user }: { user: Session["user"] }) {
  const can = usePermissions(user)
  const [media, setMedia] = useState<MediaOption | null>(null)
  const [language, setLanguage] = useState<Language>("en")
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [reading, setReading] = useState(false)
  const [unsupported, setUnsupported] = useState<string[]>([])
  const [attempted, setAttempted] = useState(false)
  const [started, setStarted] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [release, setRelease] = useState<ReleaseSettings>(DEFAULT_RELEASE)
  const [template, setTemplate] = useState("")
  const now = useNow()
  const plan = planRelease(release, now)
  const scheduled = release.mode !== "now"
  const templateLink = resolveLink("", template, "1")
  const templateInvalid = templateLink !== null && !isWebUrl(templateLink)
  const releaseError =
    release.mode === "date" && release.date === null && !attempted ? null : plan.error
  const publishes =
    can("chapter.publish") || groups.some((group) => can("group.uploadChapters", { id: group.id }))
  const pending = useQuery({ ...pendingSubmissionsCountQueryOptions, enabled: !publishes })
  const existing = useQuery({
    queryKey: chapterNumbersQueryKey(media?.id ?? "", language),
    queryFn: ({ signal }) => fetchChapterNumbers(media?.id ?? "", language, signal),
    enabled: media !== null,
  })
  const existingNumbers = new Set(existing.data ?? [])
  const counts = new Map<number, number>()

  for (const row of rows) {
    const number = parseNumber(row.number)

    if (number !== null) {
      counts.set(number, (counts.get(number) ?? 0) + 1)
    }
  }

  const issues = new Map(
    rows.map((row) => [row.key, getIssues(row, counts, existingNumbers, template)]),
  )
  const order = new Map([...rows].sort(byNumber).map((row, index) => [row.key, index]))
  const blocked =
    [...issues.values()].some((issue) => issue.errors.length > 0) ||
    plan.error !== null ||
    templateInvalid
  const slotsLeft = Math.max(config.input.maxPendingChapters - (pending.data ?? 0), 0)
  const overCap = !publishes && pending.data !== undefined && rows.length > slotsLeft
  const editingRow = rows.find((row) => row.key === editing)
  const editingChapter =
    editingRow?.source === undefined || editingRow.source === null
      ? null
      : { number: editingRow.number, source: editingRow.source, pageKeys: editingRow.pageKeys }
  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }
  const addLinkOnly = () => {
    const numbers = rows.flatMap((row) => {
      const number = parseNumber(row.number)

      return number === null ? [] : [number]
    })
    const next = Math.floor(Math.max(0, ...numbers, ...existingNumbers)) + 1

    setStarted(false)
    setRows((current) => [
      ...current,
      {
        key: `link:${crypto.randomUUID()}`,
        source: null,
        number: String(next),
        volume: "",
        title: "",
        pageKeys: [],
        link: "",
        linkOpen: true,
      },
    ])
  }
  const addFiles = (files: Promise<DroppedFile[]>) => {
    setReading(true)
    setStarted(false)
    void files
      .then(readChapterSources)
      .then((result) => {
        setUnsupported(result.unsupported)
        setRows((current) => [...current, ...result.chapters.map(toRow)].sort(byNumber))
      })
      .finally(() => {
        setReading(false)
      })
  }

  return (
    <DashboardPage subtitle={m.upload_subtitle()} title={m.upload_title()}>
      <div sx={styles.layout}>
        <div sx={styles.card}>
          <h2 sx={styles.cardTitle}>{m.upload_settings()}</h2>
          <Field invalid={attempted && media === null}>
            <FieldLabel>{m.upload_media()}</FieldLabel>
            <MediaPicker invalid={attempted && media === null} onChange={setMedia} value={media} />
            {attempted && media === null ? (
              <FieldError match>{m.upload_media_required()}</FieldError>
            ) : null}
          </Field>
          <Field>
            <FieldLabel>{m.upload_language()}</FieldLabel>
            <LanguagePicker onChange={setLanguage} value={language} />
          </Field>
          <Field>
            <FieldLabel>{m.upload_groups()}</FieldLabel>
            <GroupPicker can={can} onChange={setGroups} value={groups} />
            <FieldDescription>{m.upload_groups_description()}</FieldDescription>
          </Field>
          <ReleaseField
            chapters={rows.length}
            error={releaseError}
            onChange={(patch) => {
              setRelease((current) => ({ ...current, ...patch }))
            }}
            value={release}
          />
          <Field invalid={templateInvalid}>
            <FieldLabel>{m.upload_link()}</FieldLabel>
            <Input
              maxLength={config.input.maxUrlLength}
              onChange={(event) => {
                setTemplate(event.target.value)
              }}
              placeholder={m.upload_link_placeholder({ token: NUMBER_TOKEN })}
              type="url"
              value={template}
            />
            <FieldDescription>
              {m.upload_link_description({ token: NUMBER_TOKEN })}
            </FieldDescription>
            {templateInvalid ? <FieldError match>{m.upload_link_invalid()}</FieldError> : null}
          </Field>
          <Alert variant={publishes ? "success" : "info"}>
            {publishes ? <CheckCircle /> : <Info />}
            <AlertTitle>
              {publishes ? PUBLISH_TITLES[release.mode]() : m.upload_will_review()}
            </AlertTitle>
            <AlertDescription>
              {publishes ? publishDescription(scheduled) : reviewDescription(scheduled)}
              {publishes || pending.data === undefined
                ? null
                : ` ${m.upload_slots_left({ count: slotsLeft, max: config.input.maxPendingChapters })}`}
            </AlertDescription>
          </Alert>
        </div>
        <div sx={styles.column}>
          {started ? (
            <Alert variant="success">
              <CheckCircle />
              <AlertTitle>{m.upload_started()}</AlertTitle>
            </Alert>
          ) : null}
          <DropZone
            disabled={reading}
            onAddLinkOnly={addLinkOnly}
            onFiles={addFiles}
            reading={reading}
          />
          {unsupported.length === 0 ? null : (
            <p sx={styles.note}>{m.upload_unsupported({ names: unsupported.join(", ") })}</p>
          )}
          {rows.length === 0 ? null : (
            <section sx={styles.card}>
              <div sx={styles.cardHeader}>
                <h2 sx={styles.cardTitle}>
                  {m.upload_chapters()}
                  <span sx={styles.count}>{rows.length}</span>
                </h2>
                <Button
                  onClick={() => {
                    setRows([])
                    setAttempted(false)
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {m.upload_clear()}
                </Button>
              </div>
              <ol sx={styles.table}>
                <li aria-hidden sx={styles.tableHead}>
                  <span>{m.upload_number()}</span>
                  <span>{m.upload_volume()}</span>
                  <span>{m.upload_chapter_title()}</span>
                  <span>{m.upload_pages()}</span>
                  <span />
                  <span />
                </li>
                {rows.map((row) => (
                  <ChapterRow
                    issues={issues.get(row.key) ?? { errors: [], warnings: [] }}
                    key={row.key}
                    onChange={(patch) => {
                      updateRow(row.key, patch)
                    }}
                    onOpenPages={() => {
                      setEditing(row.key)
                    }}
                    onRemove={() => {
                      setRows((current) => current.filter((item) => item.key !== row.key))
                    }}
                    releaseAt={plan.at(order.get(row.key) ?? 0)}
                    row={row}
                    showErrors={attempted}
                    template={template}
                  />
                ))}
              </ol>
            </section>
          )}
          {rows.length === 0 ? null : (
            <div sx={styles.footer}>
              <FooterStatus
                attempted={attempted}
                blocked={blocked}
                overCap={overCap}
                pages={rows.reduce((sum, row) => sum + row.pageKeys.length, 0)}
              />
              <Button
                disabled={reading}
                onClick={() => {
                  setAttempted(true)

                  const startPlan = planRelease(release, Date.now())

                  if (media === null || blocked || overCap || startPlan.error !== null) {
                    return
                  }

                  uploadStore.start({
                    mediaId: media.id,
                    mediaTitle: media.title,
                    language,
                    groupIds: groups.map((group) => group.id),
                    jobs: rows.map((row) => ({
                      key: row.key,
                      number: parseNumber(row.number) ?? 0,
                      volume: row.volume.trim() === "" ? null : row.volume.trim(),
                      title: row.title.trim() === "" ? null : row.title.trim(),
                      source: row.source,
                      pageKeys: row.pageKeys,
                      publishAt: startPlan.at(order.get(row.key) ?? 0)?.toISOString() ?? null,
                      externalUrl: resolveLink(row.link, template, linkNumber(row)),
                    })),
                  })
                  setRows([])
                  setUnsupported([])
                  setAttempted(false)
                  setStarted(true)
                }}
              >
                <Upload />
                {m.upload_start({ count: rows.length })}
              </Button>
            </div>
          )}
        </div>
      </div>
      <ChapterPagesDialog
        chapter={editingChapter}
        onChange={(pageKeys) => {
          if (editingRow !== undefined) {
            updateRow(editingRow.key, { pageKeys })
          }
        }}
        onClose={() => {
          setEditing(null)
        }}
      />
    </DashboardPage>
  )
}

function FooterStatus({
  attempted,
  blocked,
  overCap,
  pages,
}: {
  attempted: boolean
  blocked: boolean
  overCap: boolean
  pages: number
}) {
  if (overCap) {
    return (
      <span sx={styles.footerError}>
        {m.upload_over_cap({ max: config.input.maxPendingChapters })}
      </span>
    )
  }

  if (attempted && blocked) {
    return <span sx={styles.footerError}>{m.upload_fix_first()}</span>
  }

  return <span sx={styles.footerText}>{m.upload_total_pages({ count: pages })}</span>
}
