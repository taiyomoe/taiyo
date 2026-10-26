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
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { Switch } from "@taiyomoe/ui/components/ui/switch"
import { Tabs, TabsList, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { colors, motion, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { DateTimePicker, formatDateTime } from "@/components/fields/date-time-picker"
import { LanguagePicker } from "@/components/fields/language-picker"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { type GroupOption, GroupPicker } from "@/features/groups/components/group-picker"
import { searchMediasQueryOptions } from "@/features/media/api/medias"
import { pendingSubmissionsCountQueryOptions } from "@/features/uploads/api/submissions"
import { SortablePageGrid } from "@/features/uploads/components/sortable-page-grid"
import {
  hostOf,
  isWebUrl,
  NUMBER_TOKEN,
  resolveLink,
} from "@/features/uploads/lib/chapter-batch/links"
import { parseChapterName } from "@/features/uploads/lib/chapter-batch/parse-chapter-name"
import {
  DEFAULT_RELEASE,
  planRelease,
  RELEASE_MODES,
  RELEASE_UNITS,
  type ReleaseMode,
  type ReleaseSettings,
  type ReleaseUnit,
} from "@/features/uploads/lib/chapter-batch/release"
import {
  type ChapterSource,
  type DroppedFile,
  filesFromInput,
  readChapterSources,
  walk,
} from "@/features/uploads/lib/chapter-batch/sources"
import { uploadStore } from "@/features/uploads/lib/chapter-batch/upload-store"
import { useNow } from "@/hooks/use-now"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { usePermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

type MediaOption = { id: string; title: string; type: string }

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
  tabs: {
    width: "100%",
  },
  tab: {
    flexGrow: 1,
  },
  amount: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "5rem minmax(0, 1fr)",
  },
  spacing: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
  },
  switch: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
  },
  caption: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
  popup: {
    maxWidth: "60rem",
  },
  loading: {
    margin: 0,
    color: colors.mutedForeground,
  },
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  optionLabel: {
    overflow: "hidden",
    flexGrow: 1,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  muted: {
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
  },
})
const PUBLISH_TITLES: Record<ReleaseSettings["mode"], () => string> = {
  now: m.upload_will_publish,
  date: m.uploads_state_scheduled,
  delay: m.uploads_state_scheduled,
}
const MODE_LABELS: Record<ReleaseMode, () => string> = {
  now: m.upload_release_now,
  date: m.upload_release_date,
  delay: m.upload_release_delay,
}
const UNIT_LABELS: Record<ReleaseUnit, () => string> = {
  hours: m.upload_unit_hours,
  days: m.upload_unit_days,
}
const parseNumber = (value: string) => {
  const number = Number(value.replace(",", "."))

  return value.trim() === "" || !Number.isFinite(number) || number < 0 ? null : number
}
const byNumber = (a: Row, b: Row) =>
  (parseNumber(a.number) ?? Number.POSITIVE_INFINITY) -
    (parseNumber(b.number) ?? Number.POSITIVE_INFINITY) ||
  (a.source?.name ?? "").localeCompare(b.source?.name ?? "", undefined, { numeric: true })
const linkNumber = (row: Row) => String(parseNumber(row.number) ?? row.number)

type RowIssues = { errors: string[]; warnings: string[] }

export const Route = createFileRoute("/dashboard/upload")({
  head: () => ({ meta: [{ title: m.upload_meta_title() }] }),
  component: function UploadPage() {
    const { session } = Route.useRouteContext()
    const { user } = session
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
    const [over, setOver] = useState(false)
    const [mediaSearch, setMediaSearch] = useState("")
    const mediaQuery = useDeferredValue(mediaSearch.trim())
    const mediaResults = useQuery({
      ...searchMediasQueryOptions({ q: mediaQuery, page: 1, perPage: 10 }),
      enabled: mediaQuery.length > 0,
    })
    const now = useNow()
    const plan = planRelease(release, now)
    const scheduled = release.mode !== "now"
    const templateLink = resolveLink("", template, "1")
    const templateInvalid = templateLink !== null && !isWebUrl(templateLink)
    const releaseError =
      release.mode === "date" && release.date === null && !attempted ? null : plan.error
    const publishes =
      can("chapter.publish") ||
      groups.some((group) => can("group.uploadChapters", { id: group.id }))
    const pending = useQuery({ ...pendingSubmissionsCountQueryOptions, enabled: !publishes })
    const existing = useQuery({
      queryKey: ["medias", media?.id ?? "", "chapter-numbers", language] as const,
      queryFn: async ({ signal }) =>
        unwrap(
          await api.medias[":id"]["chapter-numbers"].$get(
            { param: { id: media?.id ?? "" }, query: { language } },
            { init: { signal } },
          ),
        ),
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
      rows.map((row) => {
        const found: RowIssues = { errors: [], warnings: [] }
        const number = parseNumber(row.number)
        const link = resolveLink(row.link, template, linkNumber(row))

        if (number === null) {
          found.errors.push(m.upload_warning_number())
        } else if ((counts.get(number) ?? 0) > 1) {
          found.warnings.push(m.upload_warning_duplicate())
        } else if (existingNumbers.has(number)) {
          found.warnings.push(m.upload_warning_exists())
        }

        if (row.source === null && link === null) {
          found.errors.push(m.upload_warning_link_required())
        } else if (row.link.trim() !== "" && !isWebUrl(row.link.trim())) {
          found.errors.push(m.upload_link_invalid())
        }

        if (row.source !== null) {
          const sizes = new Map(row.source.pages.map((page) => [page.key, page.size]))
          const oversized = row.pageKeys.filter(
            (key) => (sizes.get(key) ?? 0) > config.images.maxChapterPageSizeBytes,
          ).length

          if (row.pageKeys.length === 0) {
            found.errors.push(m.upload_warning_no_pages())
          }

          if (row.pageKeys.length > config.images.maxChapterPages) {
            found.errors.push(m.upload_warning_too_many({ max: config.images.maxChapterPages }))
          }

          if (oversized > 0) {
            found.errors.push(m.upload_warning_too_large({ count: oversized }))
          }
        }

        return [row.key, found]
      }),
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
        : {
            key: editingRow.key,
            number: editingRow.number,
            source: editingRow.source,
            pageKeys: editingRow.pageKeys,
          }
    const mediaOptions: MediaOption[] = (mediaResults.data?.data ?? []).flatMap((hit) =>
      hit.mainTitle === null ? [] : [{ id: hit.id, title: hit.mainTitle.title, type: hit.type }],
    )
    let mediaEmptyMessage = mediaResults.isFetching ? m.upload_searching() : m.upload_media_empty()

    if (mediaQuery.length === 0) {
      mediaEmptyMessage = m.upload_media_hint()
    }

    let releaseDescription = m.upload_will_review_description()

    if (publishes && scheduled) {
      releaseDescription = m.upload_will_schedule_description()
    } else if (publishes) {
      releaseDescription = m.upload_will_publish_description()
    } else if (scheduled) {
      releaseDescription = m.upload_will_review_scheduled_description()
    }

    let footerStatus = (
      <span sx={styles.footerText}>
        {m.upload_total_pages({ count: rows.reduce((sum, row) => sum + row.pageKeys.length, 0) })}
      </span>
    )

    if (overCap) {
      footerStatus = (
        <span sx={styles.footerError}>
          {m.upload_over_cap({ max: config.input.maxPendingChapters })}
        </span>
      )
    } else if (attempted && blocked) {
      footerStatus = <span sx={styles.footerError}>{m.upload_fix_first()}</span>
    }

    const updateRow = (key: string, patch: Partial<Row>) => {
      setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
    }
    const updateRelease = (patch: Partial<ReleaseSettings>) => {
      setRelease((current) => ({ ...current, ...patch }))
    }
    const addFiles = (files: Promise<DroppedFile[]>) => {
      setReading(true)
      setStarted(false)
      void files
        .then(readChapterSources)
        .then((result) => {
          const added = result.chapters.map((source) => {
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
            } satisfies Row
          })

          setUnsupported(result.unsupported)
          setRows((current) => [...current, ...added].sort(byNumber))
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
              <Combobox<MediaOption>
                filter={null}
                inputValue={mediaSearch}
                isItemEqualToValue={(a, b) => a.id === b.id}
                itemToStringLabel={(item) => item.title}
                items={
                  media === null || mediaOptions.some((item) => item.id === media.id)
                    ? mediaOptions
                    : [media, ...mediaOptions]
                }
                onInputValueChange={setMediaSearch}
                onValueChange={setMedia}
                value={media}
              >
                <ComboboxInput
                  aria-invalid={(attempted && media === null) || undefined}
                  placeholder={m.upload_media_placeholder()}
                />
                <ComboboxPopup>
                  <ComboboxList>
                    {(item: MediaOption) => (
                      <ComboboxItem key={item.id} value={item}>
                        <span sx={styles.option}>
                          <span sx={styles.optionLabel}>{item.title}</span>
                          <span sx={styles.muted}>{item.type}</span>
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                  <ComboboxEmpty>{mediaEmptyMessage}</ComboboxEmpty>
                </ComboboxPopup>
              </Combobox>
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
            <Field invalid={releaseError !== null}>
              <FieldLabel>{m.upload_release()}</FieldLabel>
              <Tabs
                onValueChange={(mode: ReleaseMode) => {
                  updateRelease({ mode })
                }}
                sx={styles.tabs}
                value={release.mode}
              >
                <TabsList aria-label={m.upload_release_mode()} sx={styles.tabs}>
                  {RELEASE_MODES.map((mode) => (
                    <TabsTab key={mode} sx={styles.tab} value={mode}>
                      {MODE_LABELS[mode]()}
                    </TabsTab>
                  ))}
                </TabsList>
              </Tabs>
              {release.mode === "date" ? (
                <DateTimePicker
                  invalid={releaseError !== null}
                  label={m.upload_release_date()}
                  onChange={(date) => {
                    updateRelease({ date })
                  }}
                  value={release.date}
                />
              ) : null}
              {release.mode === "delay" ? (
                <>
                  <span sx={styles.caption}>{m.upload_release_in()}</span>
                  <AmountInput
                    amount={release.delay}
                    invalid={releaseError !== null}
                    onChange={({ amount, unit }) => {
                      updateRelease({
                        delay: amount ?? release.delay,
                        delayUnit: unit ?? release.delayUnit,
                      })
                    }}
                    unit={release.delayUnit}
                  />
                </>
              ) : null}
              {release.mode !== "now" && rows.length > 1 ? (
                <div sx={styles.spacing}>
                  <label sx={styles.switch}>
                    <Switch
                      checked={release.spaced}
                      onCheckedChange={(spaced) => {
                        updateRelease({ spaced })
                      }}
                    />
                    {m.upload_release_spacing()}
                  </label>
                  {release.spaced ? (
                    <>
                      <span sx={styles.caption}>{m.upload_release_every()}</span>
                      <AmountInput
                        amount={release.spacing}
                        invalid={false}
                        onChange={({ amount, unit }) => {
                          updateRelease({
                            spacing: amount ?? release.spacing,
                            spacingUnit: unit ?? release.spacingUnit,
                          })
                        }}
                        unit={release.spacingUnit}
                      />
                      <span sx={styles.caption}>{m.upload_release_spacing_description()}</span>
                    </>
                  ) : null}
                </div>
              ) : null}
              <FieldDescription>
                {release.mode === "now"
                  ? m.upload_release_now_description()
                  : m.upload_release_scheduled_description()}
              </FieldDescription>
              {releaseError === null ? null : <FieldError match>{releaseError}</FieldError>}
            </Field>
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
                {releaseDescription}
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

                if (!reading) {
                  const entries = [...event.dataTransfer.items].flatMap((item) => {
                    const entry = item.webkitGetAsEntry()

                    return entry === null ? [] : [entry]
                  })

                  addFiles(
                    Promise.all(entries.map((entry) => walk(entry, ""))).then((files) =>
                      files.flat(),
                    ),
                  )
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
                  <Button disabled={reading} render={<label />} variant="outline">
                    {m.upload_choose_folder()}
                    <input
                      disabled={reading}
                      multiple
                      onChange={(event) => {
                        addFiles(Promise.resolve(filesFromInput(event.target.files)))
                        event.target.value = ""
                      }}
                      ref={(input) => {
                        input?.setAttribute("webkitdirectory", "")
                      }}
                      sx={styles.hiddenInput}
                      type="file"
                    />
                  </Button>
                  <Button disabled={reading} render={<label />} variant="outline">
                    {m.upload_choose_files()}
                    <input
                      accept="image/jpeg,image/png,image/webp,image/gif,.zip,.cbz"
                      disabled={reading}
                      multiple
                      onChange={(event) => {
                        addFiles(Promise.resolve(filesFromInput(event.target.files)))
                        event.target.value = ""
                      }}
                      sx={styles.hiddenInput}
                      type="file"
                    />
                  </Button>
                  <Button
                    disabled={reading}
                    onClick={() => {
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
                    }}
                    variant="ghost"
                  >
                    <Plus />
                    {m.upload_add_link_only()}
                  </Button>
                </div>
              )}
            </div>
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
                  {rows.map((row) => {
                    const rowIssues = issues.get(row.key) ?? { errors: [], warnings: [] }
                    const releaseAt = plan.at(order.get(row.key) ?? 0)
                    const fromTemplate = resolveLink("", template, linkNumber(row))
                    const link = resolveLink(row.link, template, linkNumber(row))
                    const linkVisible = row.source === null || row.linkOpen || row.link !== ""
                    const linkInvalid =
                      (row.link.trim() !== "" && !isWebUrl(row.link.trim())) ||
                      (attempted && row.source === null && link === null)

                    return (
                      <li key={row.key} sx={styles.row}>
                        <div sx={styles.rowFields}>
                          <Field invalid={attempted && parseNumber(row.number) === null}>
                            <Input
                              aria-label={m.upload_number()}
                              inputMode="decimal"
                              onChange={(event) => {
                                updateRow(row.key, { number: event.target.value })
                              }}
                              size="sm"
                              value={row.number}
                            />
                          </Field>
                          <Input
                            aria-label={m.upload_volume()}
                            maxLength={config.input.maxVolumeLength}
                            onChange={(event) => {
                              updateRow(row.key, { volume: event.target.value })
                            }}
                            size="sm"
                            value={row.volume}
                          />
                          <Input
                            aria-label={m.upload_chapter_title()}
                            maxLength={config.input.maxChapterTitleLength}
                            onChange={(event) => {
                              updateRow(row.key, { title: event.target.value })
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
                              onClick={() => {
                                setEditing(row.key)
                              }}
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
                                updateRow(
                                  row.key,
                                  linkVisible ? { link: "", linkOpen: false } : { linkOpen: true },
                                )
                              }}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <LinkIcon />
                            </Button>
                          )}
                          <Button
                            aria-label={m.upload_remove_chapter()}
                            onClick={() => {
                              setRows((current) => current.filter((item) => item.key !== row.key))
                            }}
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
                                updateRow(row.key, { link: event.target.value })
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
                            {row.source === null
                              ? m.upload_link_only_source()
                              : row.source.name || "—"}
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
                          {rowIssues.warnings.map((warning) => (
                            <span key={warning} sx={styles.warning}>
                              {warning}
                            </span>
                          ))}
                          {attempted
                            ? rowIssues.errors.map((error) => (
                                <span key={error} sx={styles.error}>
                                  {error}
                                </span>
                              ))
                            : null}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>
            )}
            {rows.length === 0 ? null : (
              <div sx={styles.footer}>
                {footerStatus}
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
        <Dialog
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null)
            }
          }}
          open={editingChapter !== null}
        >
          <DialogPopup sx={styles.popup}>
            {editingChapter === null ? null : (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {m.upload_pages_button({ number: editingChapter.number || "?" })}
                  </DialogTitle>
                  <DialogDescription>{m.upload_pages_dialog_description()}</DialogDescription>
                </DialogHeader>
                <DialogPanel>
                  <PagesPreview
                    onChange={(pageKeys) => {
                      updateRow(editingChapter.key, { pageKeys })
                    }}
                    pageKeys={editingChapter.pageKeys}
                    source={editingChapter.source}
                  />
                </DialogPanel>
                <DialogFooter>
                  <DialogClose render={<Button />}>{m.upload_done()}</DialogClose>
                </DialogFooter>
              </>
            )}
          </DialogPopup>
        </Dialog>
      </DashboardPage>
    )
  },
})

function AmountInput({
  amount,
  unit,
  invalid,
  onChange,
}: {
  amount: string
  unit: ReleaseUnit
  invalid: boolean
  onChange: (patch: { amount?: string; unit?: ReleaseUnit }) => void
}) {
  return (
    <div sx={styles.amount}>
      <Input
        aria-invalid={invalid || undefined}
        aria-label={m.upload_release_amount()}
        inputMode="decimal"
        onChange={(event) => {
          onChange({ amount: event.target.value })
        }}
        value={amount}
      />
      <Select
        onValueChange={(next: ReleaseUnit | null) => {
          if (next !== null) {
            onChange({ unit: next })
          }
        }}
        value={unit}
      >
        <SelectTrigger aria-label={m.upload_release_unit()}>
          <SelectValue>{() => UNIT_LABELS[unit]()}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {RELEASE_UNITS.map((value) => (
            <SelectItem key={value} value={value}>
              {UNIT_LABELS[value]()}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
    </div>
  )
}

function PagesPreview({
  source,
  pageKeys,
  onChange,
}: {
  source: ChapterSource
  pageKeys: string[]
  onChange: (pageKeys: string[]) => void
}) {
  const { data } = useQuery({
    queryKey: ["chapter-batch", "pages", source.key],
    queryFn: () => source.open(),
    gcTime: 0,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const urls = useMemo(
    () =>
      new Map(
        [...(data ?? new Map<string, Blob>())].map(([key, blob]) => [
          key,
          URL.createObjectURL(blob),
        ]),
      ),
    [data],
  )

  useEffect(
    () => () => {
      for (const url of urls.values()) {
        URL.revokeObjectURL(url)
      }
    },
    [urls],
  )

  if (data === undefined) {
    return <p sx={styles.loading}>{m.upload_pages_loading()}</p>
  }

  return (
    <SortablePageGrid
      onRemove={(key) => {
        onChange(pageKeys.filter((item) => item !== key))
      }}
      onReorder={onChange}
      pages={pageKeys.map((key) => ({ key, url: urls.get(key) ?? null }))}
    />
  )
}
