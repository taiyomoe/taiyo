import * as stylex from "@stylexjs/stylex"
import {
  isSupportedLanguage,
  type Language,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@taiyomoe/db/constants"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { breakpoints, colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { LanguagePicker } from "@/components/fields/language-picker"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { RichTextEditor } from "@/components/rich-text/rich-text-editor"
import { getContentLanguage } from "@/lib/locale"
import { m } from "@/paraglide/messages"

export type AboutText = Partial<Record<Language, string | undefined>>

const ABOUT_MAX = 2000
const styles = stylex.create({
  head: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  tools: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexGrow: { default: 1, [breakpoints.sm]: 0 },
    justifyContent: "flex-end",
    minWidth: 0,
  },
  language: {
    flexBasis: "11rem",
    flexGrow: { default: 1, [breakpoints.sm]: 0 },
    flexShrink: 1,
    minWidth: 0,
  },
  foot: {
    gap: "1rem",
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  preview: {
    padding: "1rem",
    borderColor: colors.input,
    borderRadius: radius.xl,
    borderStyle: "solid",
    borderWidth: 1,
    minHeight: "9rem",
    width: "100%",
  },
  empty: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  counter: {
    color: colors.mutedForeground,
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
})

/** The about text as the API takes it: one trimmed text per supported language, empty ones removed by the API. */
export const toAboutPayload = (about: AboutText) =>
  Object.fromEntries(
    Object.entries(about).flatMap(([code, value]) =>
      isSupportedLanguage(code) ? [[code, value?.trim() ?? ""]] : [],
    ),
  )

const normalize = (about: AboutText) =>
  JSON.stringify(
    Object.entries(about)
      .map(([code, value]) => [code, value?.trim() ?? ""])
      .filter(([, value]) => value !== "")
      .sort(([a = ""], [b = ""]) => a.localeCompare(b)),
  )

export const isSameAbout = (a: AboutText, b: AboutText) => normalize(a) === normalize(b)

/** The about text of a profile, written one language at a time in Markdown, with a preview. */
export function AboutField({
  label,
  about,
  placeholder,
  onChange,
}: {
  label: string
  about: AboutText
  placeholder?: string
  onChange: (about: AboutText) => void
}) {
  // Starts on the language the profile shows to this reader, unless the text only exists in others.
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const preferred = getContentLanguage()
    const existing = Object.keys(about).find(isSupportedLanguage)

    return existing === undefined || preferred in about ? preferred : existing
  })
  const [mode, setMode] = useState<"write" | "preview">("write")
  const text = about[language] ?? ""
  const document = mode === "preview" ? parseRichText(text) : null

  return (
    <Field>
      <div sx={styles.head}>
        <FieldLabel>{label}</FieldLabel>
        <div sx={styles.tools}>
          <SegmentedControl
            aria-label={m.user_settings_about_mode()}
            onValueChange={(value) => {
              setMode(value === "preview" ? "preview" : "write")
            }}
            value={mode}
          >
            <SegmentedControlItem value="write">
              {m.user_settings_about_write()}
            </SegmentedControlItem>
            <SegmentedControlItem value="preview">
              {m.user_settings_about_preview()}
            </SegmentedControlItem>
          </SegmentedControl>
          <div sx={styles.language}>
            <LanguagePicker
              languages={SUPPORTED_LANGUAGES}
              onChange={setLanguage}
              value={language}
            />
          </div>
        </div>
      </div>
      {document === null ? (
        <RichTextEditor
          maxLength={ABOUT_MAX}
          onChange={(event) => {
            onChange({ ...about, [language]: event.target.value })
          }}
          placeholder={placeholder}
          rows={7}
          value={text}
        />
      ) : (
        <div sx={styles.preview}>
          {document.children.length === 0 ? (
            <p sx={styles.empty}>{m.user_settings_about_preview_empty()}</p>
          ) : (
            <RichText document={document} />
          )}
        </div>
      )}
      <div sx={styles.foot}>
        <FieldDescription>{m.user_settings_about_markdown()}</FieldDescription>
        <span sx={styles.counter}>
          {m.comments_counter({ count: text.length, max: ABOUT_MAX })}
        </span>
      </div>
    </Field>
  )
}
