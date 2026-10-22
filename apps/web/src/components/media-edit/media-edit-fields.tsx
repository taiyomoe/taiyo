import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import {
  CONTENT_RATINGS,
  LANGUAGES,
  type Language,
  MEDIA_COUNTRIES_OF_ORIGIN,
  MEDIA_DEMOGRAPHIES,
  MEDIA_LINK_KEYS,
  MEDIA_LINK_NUMBER_KEYS,
  MEDIA_SOURCES,
  MEDIA_STATUSES,
  MEDIA_TYPES,
  type MediaEditField,
  STAFF_ROLES,
  type StaffRole,
} from "@taiyomoe/db/constants"
import { ChevronDown, ChevronUp, Close, Crown, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@taiyomoe/ui/components/ui/combobox"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { Toggle } from "@taiyomoe/ui/components/ui/toggle"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { type ReactNode, useDeferredValue, useState } from "react"
import { getLanguageName, LanguageFlag } from "@/components/chapters/flags"
import {
  type MediaEditDraft,
  type MediaEditStaff,
  type MediaEditTitle,
  getLinkError,
  getTitlesError,
} from "@/components/media-edit/media-edit-model"
import {
  CONTENT_RATING_LABELS,
  MEDIA_COUNTRY_LABELS,
  MEDIA_DEMOGRAPHY_LABELS,
  MEDIA_LINKS,
  MEDIA_SOURCE_LABELS,
  MEDIA_STATUS_LABELS,
  MEDIA_TYPE_LABELS,
} from "@/components/media/media-labels"
import { LanguagePicker } from "@/components/submissions/pickers"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  stack: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  titleRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: {
      default: "auto minmax(0, 1fr) auto",
      "@media (width >= 48rem)": "auto minmax(0, 1fr) 13rem auto auto",
    },
  },
  titleLanguage: {
    gridColumn: { default: "2 / -1", "@media (width >= 48rem)": "auto" },
  },
  rowActions: {
    gap: "0.125rem",
    display: "flex",
  },
  mainOn: {
    color: colors.warning,
  },
  mainOff: {
    color: colors.mutedForeground,
  },
  addRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  addPicker: {
    flexGrow: 1,
    maxWidth: "20rem",
    minWidth: "12rem",
  },
  synopsisLabel: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  languageName: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  grid: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
  },
  chips: {
    margin: 0,
    padding: 0,
    gap: "0.5rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    borderRadius: radius.full,
    gap: "0.125rem",
    paddingBlock: "0.125rem",
    alignItems: "center",
    backgroundColor: colors.muted,
    display: "flex",
    fontSize: "0.875rem",
    paddingInlineEnd: "0.125rem",
    paddingInlineStart: "0.75rem",
  },
  chipLabel: {
    paddingInlineEnd: "0.25rem",
  },
  chipSpoiler: {
    color: colors.warning,
  },
  spoilerToggle: {
    color: {
      "[data-pressed]": colors.warning,
      default: colors.mutedForeground,
    },
    fontSize: "0.75rem",
  },
  staffRow: {
    gap: "0.5rem",
    alignItems: "center",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 10rem auto",
  },
  staffName: {
    overflow: "hidden",
    fontWeight: 500,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  option: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    minWidth: 0,
    width: "100%",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

type Editor<T> = { value: T; onChange: (value: T) => void }

const move = <T,>(items: readonly T[], index: number, offset: number) => {
  const next = [...items]
  const [item] = next.splice(index, 1)

  if (item !== undefined) {
    next.splice(index + offset, 0, item)
  }

  return next
}
const useRowKeys = (length: number) => {
  const [keys, setKeys] = useState<string[]>(() =>
    Array.from({ length }, () => crypto.randomUUID()),
  )
  const synced =
    keys.length === length
      ? keys
      : Array.from({ length }, (_, index) => keys[index] ?? `row-${index}`)

  return {
    keys: synced,
    add: () => {
      setKeys([...synced, crypto.randomUUID()])
    },
    remove: (index: number) => {
      setKeys(synced.filter((_, i) => i !== index))
    },
    move: (index: number, offset: number) => {
      setKeys(move(synced, index, offset))
    },
  }
}
const LANGUAGE_OPTIONS = [...LANGUAGES]
  .map((code) => ({ code, name: getLanguageName(code) }))
  .sort((a, b) => a.name.localeCompare(b.name))

function EnumSelect<T extends string>({
  value,
  onChange,
  options,
  labels,
  label,
}: Editor<T> & {
  options: readonly T[]
  labels: Record<T, () => string>
  label: string
}) {
  return (
    <Select
      onValueChange={(next) => {
        if (next !== null) {
          onChange(next)
        }
      }}
      value={value}
    >
      <SelectTrigger aria-label={label}>
        <SelectValue>{() => labels[value]()}</SelectValue>
      </SelectTrigger>
      <SelectPopup>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labels[option]()}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  )
}

const TAG_OPTIONS = Object.entries(config.tags)
  .map(([key, tag]) => ({ key, name: tag.name.en, category: tag.category }))
  .sort((a, b) => a.name.localeCompare(b.name))
const TAG_NAMES = new Map(TAG_OPTIONS.map((tag) => [tag.key, tag.name]))

export const getTagName = (key: string) => TAG_NAMES.get(key) ?? key

const isNumberKey = (key: string) => (MEDIA_LINK_NUMBER_KEYS as readonly string[]).includes(key)
const LINK_PLACEHOLDERS: Partial<Record<string, string>> = {
  mangaDex: "0ca1627e-95dd-4118-892a-f144adf02256",
  anilist: "31224",
  myAnimeList: "1224",
}

export const STAFF_ROLE_LABELS: Record<StaffRole, () => string> = {
  AUTHOR: m.media_info_authors,
  ARTIST: m.media_info_artists,
}

type StaffOption = { id: string; name: string }

type EditorProps = { draft: MediaEditDraft; onChange: (draft: MediaEditDraft) => void }

const enumEditor =
  <K extends "type" | "status" | "source" | "demography" | "countryOfOrigin" | "contentRating">(
    key: K,
    options: ReadonlyArray<MediaEditDraft[K]>,
    labels: Record<MediaEditDraft[K], () => string>,
    label: () => string,
  ) =>
  ({ draft, onChange }: EditorProps) => (
    <EnumSelect
      label={label()}
      labels={labels}
      onChange={(next) => {
        onChange({ ...draft, [key]: next })
      }}
      options={options}
      value={draft[key]}
    />
  )
const dateEditor =
  (key: "startDate" | "endDate", label: () => string) =>
  ({ draft, onChange }: EditorProps) => (
    <Input
      aria-label={label()}
      onChange={(event) => {
        onChange({
          ...draft,
          [key]: event.target.value === "" ? null : `${event.target.value}T00:00:00.000Z`,
        })
      }}
      type="date"
      value={draft[key]?.slice(0, 10) ?? ""}
    />
  )
const EDITORS: Record<MediaEditField, (props: EditorProps) => ReactNode> = {
  titles: function TitlesEditor({ draft, onChange: change }: EditorProps) {
    const value = draft.titles
    const onChange = (next: MediaEditTitle[]) => {
      change({ ...draft, titles: next })
    }
    const rows = useRowKeys(value.length)
    const error = getTitlesError(value)
    const update = (index: number, patch: Partial<MediaEditTitle>) => {
      onChange(value.map((title, i) => (i === index ? { ...title, ...patch } : title)))
    }

    return (
      <div sx={styles.stack}>
        {value.map((title, index) => (
          <div key={rows.keys[index]} sx={styles.titleRow}>
            <Button
              aria-label={m.media_edit_title_main()}
              aria-pressed={title.isMainTitle}
              onClick={() => {
                onChange(value.map((item, i) => ({ ...item, isMainTitle: i === index })))
              }}
              size="icon-sm"
              title={m.media_edit_title_main()}
              variant="ghost"
            >
              <Crown {...stylex.props(title.isMainTitle ? styles.mainOn : styles.mainOff)} />
            </Button>
            <Input
              aria-label={m.media_edit_field_titles()}
              onChange={(event) => {
                update(index, { title: event.target.value })
              }}
              value={title.title}
            />
            <div sx={styles.titleLanguage}>
              <LanguagePicker
                onChange={(language) => {
                  update(index, { language })
                }}
                value={title.language}
              />
            </div>
            <Toggle
              onPressedChange={(isAcronym) => {
                update(index, { isAcronym })
              }}
              pressed={title.isAcronym}
              size="sm"
              variant="outline"
            >
              {m.media_edit_title_acronym()}
            </Toggle>
            <div sx={styles.rowActions}>
              <Button
                aria-label={m.media_edit_move_up()}
                disabled={index === 0}
                onClick={() => {
                  rows.move(index, -1)
                  onChange(move(value, index, -1))
                }}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronUp />
              </Button>
              <Button
                aria-label={m.media_edit_move_down()}
                disabled={index === value.length - 1}
                onClick={() => {
                  rows.move(index, 1)
                  onChange(move(value, index, 1))
                }}
                size="icon-sm"
                variant="ghost"
              >
                <ChevronDown />
              </Button>
              <Button
                aria-label={m.media_edit_remove()}
                onClick={() => {
                  rows.remove(index)
                  onChange(value.filter((_, i) => i !== index))
                }}
                size="icon-sm"
                variant="ghost"
              >
                <Close />
              </Button>
            </div>
          </div>
        ))}
        {error === null ? null : (
          <Field invalid>
            <FieldError match>{error}</FieldError>
          </Field>
        )}
        <div sx={styles.addRow}>
          <Button
            onClick={() => {
              rows.add()
              onChange([
                ...value,
                { title: "", language: "en", isAcronym: false, isMainTitle: value.length === 0 },
              ])
            }}
            size="sm"
            variant="outline"
          >
            <Plus />
            {m.media_edit_title_add()}
          </Button>
        </div>
      </div>
    )
  },
  synopsis: function SynopsisEditor({ draft, onChange: change }: EditorProps) {
    const value = draft.synopsis
    const onChange = (next: MediaEditDraft["synopsis"]) => {
      change({ ...draft, synopsis: next })
    }
    const [extra, setExtra] = useState<Language[]>([])
    const languages = [
      ...Object.keys(value).filter((key): key is Language =>
        (LANGUAGES as readonly string[]).includes(key),
      ),
      ...extra.filter((language) => !(language in value)),
    ]

    return (
      <div sx={styles.stack}>
        {languages.length === 0 ? <p sx={styles.muted}>{m.media_info_no_synopsis()}</p> : null}
        {languages.map((language) => (
          <Field key={language}>
            <div sx={styles.synopsisLabel}>
              <FieldLabel>
                <span sx={styles.languageName}>
                  <LanguageFlag language={language} />
                  {getLanguageName(language)}
                </span>
              </FieldLabel>
              <Button
                aria-label={m.media_edit_remove()}
                onClick={() => {
                  const { [language]: _removed, ...rest } = value

                  setExtra(extra.filter((item) => item !== language))
                  onChange(rest)
                }}
                size="icon-sm"
                variant="ghost"
              >
                <Close />
              </Button>
            </div>
            <Textarea
              maxLength={config.input.maxSynopsisLength}
              onChange={(event) => {
                onChange({ ...value, [language]: event.target.value })
              }}
              rows={6}
              value={value[language] ?? ""}
            />
          </Field>
        ))}
        <div sx={styles.addRow}>
          <div sx={styles.addPicker}>
            <Combobox<(typeof LANGUAGE_OPTIONS)[number]>
              isItemEqualToValue={(a, b) => a.code === b.code}
              itemToStringLabel={(item) => item.name}
              items={LANGUAGE_OPTIONS.filter((option) => !languages.includes(option.code))}
              onValueChange={(next) => {
                if (next !== null) {
                  setExtra([...extra, next.code])
                }
              }}
              value={null}
            >
              <ComboboxInput placeholder={m.media_edit_synopsis_add()} size="sm" />
              <ComboboxPopup>
                <ComboboxList>
                  {(item: (typeof LANGUAGE_OPTIONS)[number]) => (
                    <ComboboxItem key={item.code} value={item}>
                      <span sx={styles.option}>
                        <LanguageFlag language={item.code} />
                        {item.name}
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
                <ComboboxEmpty>{m.upload_language_empty()}</ComboboxEmpty>
              </ComboboxPopup>
            </Combobox>
          </div>
        </div>
      </div>
    )
  },
  type: enumEditor("type", MEDIA_TYPES, MEDIA_TYPE_LABELS, m.media_info_type),
  status: enumEditor("status", MEDIA_STATUSES, MEDIA_STATUS_LABELS, m.media_info_status),
  source: enumEditor("source", MEDIA_SOURCES, MEDIA_SOURCE_LABELS, m.media_info_source),
  demography: enumEditor(
    "demography",
    MEDIA_DEMOGRAPHIES,
    MEDIA_DEMOGRAPHY_LABELS,
    m.media_info_demography,
  ),
  countryOfOrigin: enumEditor(
    "countryOfOrigin",
    MEDIA_COUNTRIES_OF_ORIGIN,
    MEDIA_COUNTRY_LABELS,
    m.media_info_country,
  ),
  contentRating: enumEditor(
    "contentRating",
    CONTENT_RATINGS,
    CONTENT_RATING_LABELS,
    m.media_info_content_rating,
  ),
  startDate: dateEditor("startDate", m.media_edit_field_start_date),
  endDate: dateEditor("endDate", m.media_edit_field_end_date),
  tags: function TagsEditor({ draft, onChange: change }: EditorProps) {
    const value = draft.tags
    const onChange = (next: MediaEditDraft["tags"]) => {
      change({ ...draft, tags: next })
    }
    const [input, setInput] = useState("")

    return (
      <div sx={styles.stack}>
        {value.length === 0 ? (
          <p sx={styles.muted}>{m.media_edit_tags_empty()}</p>
        ) : (
          <ul sx={styles.chips}>
            {value.map((tag) => (
              <li key={tag.key} sx={styles.chip}>
                <span sx={[styles.chipLabel, tag.isSpoiler && styles.chipSpoiler]}>
                  {getTagName(tag.key)}
                </span>
                <Toggle
                  aria-label={m.media_edit_tag_spoiler()}
                  onPressedChange={(isSpoiler) => {
                    onChange(
                      value.map((item) => (item.key === tag.key ? { ...item, isSpoiler } : item)),
                    )
                  }}
                  pressed={tag.isSpoiler}
                  size="sm"
                  sx={styles.spoilerToggle}
                >
                  {m.media_edit_tag_spoiler()}
                </Toggle>
                <Button
                  aria-label={m.media_edit_remove()}
                  onClick={() => {
                    onChange(value.filter((item) => item.key !== tag.key))
                  }}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Close />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div sx={styles.addPicker}>
          <Combobox<(typeof TAG_OPTIONS)[number]>
            inputValue={input}
            isItemEqualToValue={(a, b) => a.key === b.key}
            itemToStringLabel={(item) => item.name}
            items={TAG_OPTIONS.filter((option) => !value.some((tag) => tag.key === option.key))}
            onInputValueChange={setInput}
            onValueChange={(next) => {
              if (next !== null) {
                onChange([...value, { key: next.key, isSpoiler: false }])
                setInput("")
              }
            }}
            value={null}
          >
            <ComboboxInput placeholder={m.media_edit_tags_add()} size="sm" />
            <ComboboxPopup>
              <ComboboxList>
                {(item: (typeof TAG_OPTIONS)[number]) => (
                  <ComboboxItem key={item.key} value={item}>
                    <span sx={styles.option}>
                      {item.name}
                      <span sx={styles.muted}>{item.category}</span>
                    </span>
                  </ComboboxItem>
                )}
              </ComboboxList>
              <ComboboxEmpty>{m.media_edit_tags_none()}</ComboboxEmpty>
            </ComboboxPopup>
          </Combobox>
        </div>
      </div>
    )
  },
  links: ({ draft, onChange: change }: EditorProps) => {
    const value = draft.links
    const onChange = (next: MediaEditDraft["links"]) => {
      change({ ...draft, links: next })
    }

    return (
      <div sx={styles.grid}>
        {MEDIA_LINK_KEYS.map((key) => {
          const current = value[key]
          const error = getLinkError(key, current)

          return (
            <Field invalid={error !== null} key={key}>
              <FieldLabel>{MEDIA_LINKS[key]?.label ?? key}</FieldLabel>
              <Input
                inputMode={isNumberKey(key) ? "numeric" : "url"}
                onChange={(event) => {
                  const { [key]: _previous, ...rest } = value
                  const text = isNumberKey(key)
                    ? event.target.value.replace(/\D/g, "")
                    : event.target.value.trim()

                  if (text === "") {
                    onChange(rest)
                  } else {
                    onChange({ ...rest, [key]: isNumberKey(key) ? Number(text) : text })
                  }
                }}
                placeholder={LINK_PLACEHOLDERS[key] ?? "https://"}
                value={current === undefined ? "" : String(current)}
              />
              {error === null ? null : <FieldError match>{error}</FieldError>}
            </Field>
          )
        })}
      </div>
    )
  },
  staffs: function StaffsEditor({ draft, onChange: change }: EditorProps) {
    const value = draft.staffs
    const onChange = (next: MediaEditStaff[]) => {
      change({ ...draft, staffs: next })
    }
    const rows = useRowKeys(value.length)
    const [input, setInput] = useState("")
    const query = useDeferredValue(input.trim())
    const { data, isFetching } = useQuery({
      queryKey: ["staffs", "search", query],
      queryFn: async ({ signal }) =>
        unwrap(
          await api.staffs.$get(
            { query: { search: query, page: "1", perPage: "10" } },
            { init: { signal } },
          ),
        ),
      enabled: query.length > 0,
    })

    return (
      <div sx={styles.stack}>
        {value.length === 0 ? <p sx={styles.muted}>{m.media_edit_staff_empty()}</p> : null}
        {value.map((staff, index) => (
          <div key={rows.keys[index]} sx={styles.staffRow}>
            <span sx={styles.staffName}>{staff.name}</span>
            <EnumSelect
              label={m.media_edit_staff_role()}
              labels={STAFF_ROLE_LABELS}
              onChange={(role) => {
                onChange(value.map((item, i) => (i === index ? { ...item, role } : item)))
              }}
              options={STAFF_ROLES}
              value={staff.role}
            />
            <Button
              aria-label={m.media_edit_remove()}
              onClick={() => {
                rows.remove(index)
                onChange(value.filter((_, i) => i !== index))
              }}
              size="icon-sm"
              variant="ghost"
            >
              <Close />
            </Button>
          </div>
        ))}
        <div sx={styles.addPicker}>
          <Combobox<StaffOption>
            filter={null}
            inputValue={input}
            isItemEqualToValue={(a, b) => a.id === b.id}
            itemToStringLabel={(item) => item.name}
            items={(data ?? []).map(({ id, name }) => ({ id, name }))}
            onInputValueChange={setInput}
            onValueChange={(next) => {
              if (next !== null) {
                rows.add()
                onChange([...value, { staffId: next.id, name: next.name, role: "AUTHOR" }])
                setInput("")
              }
            }}
            value={null}
          >
            <ComboboxInput placeholder={m.media_edit_staff_search()} size="sm" />
            <ComboboxPopup>
              <ComboboxList>
                {(item: StaffOption) => (
                  <ComboboxItem key={item.id} value={item}>
                    {item.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
              <ComboboxEmpty>
                {isFetching ? m.upload_searching() : m.media_edit_staff_none()}
              </ComboboxEmpty>
            </ComboboxPopup>
          </Combobox>
        </div>
      </div>
    )
  },
}

export function FieldEditor({ field, ...props }: EditorProps & { field: MediaEditField }) {
  const Editor = EDITORS[field]

  return <Editor {...props} />
}
