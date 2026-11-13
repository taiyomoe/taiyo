import * as stylex from "@stylexjs/stylex"
import {
  GENDERS,
  type Gender,
  isSupportedLanguage,
  type Language,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@taiyomoe/db/constants"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, font, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { LanguagePicker } from "@/components/fields/language-picker"
import { RichText } from "@/components/rich-text/rich-text"
import { parseRichText } from "@/components/rich-text/rich-text-document"
import { RichTextEditor } from "@/components/rich-text/rich-text-editor"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { type UserProfile, useUpdateProfile } from "@/features/users/api/profile"
import { CountryPicker } from "@/features/users/components/profile/dialogs/country-picker"
import { GENDER_LABELS } from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const ABOUT_MAX = 2000
const styles = stylex.create({
  aboutHead: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  aboutTools: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  modeItem: {
    height: "2rem",
  },
  language: {
    width: "11rem",
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
  counter: {
    alignSelf: "flex-end",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
})

export function AboutSection({ profile }: { profile: UserProfile }) {
  const update = useUpdateProfile(profile.username)
  const locale = getLocale()
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const existing = Object.keys(profile.about).find(isSupportedLanguage)

    return isSupportedLanguage(locale) && (existing === undefined || locale in profile.about)
      ? locale
      : (existing ?? "en")
  })
  const [mode, setMode] = useState<"write" | "preview">("write")
  const [about, setAbout] = useState<Partial<Record<Language, string | undefined>>>(profile.about)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [city, setCity] = useState(profile.city ?? "")
  const [country, setCountry] = useState(profile.country)
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "")
  const text = about[language] ?? ""
  const trimmed = (record: Partial<Record<Language, string | undefined>>) =>
    JSON.stringify(
      Object.fromEntries(
        Object.entries(record)
          .map(([code, value]) => [code, value?.trim() ?? ""])
          .filter(([, value]) => value !== "")
          .sort(([a = ""], [b = ""]) => a.localeCompare(b)),
      ),
    )
  const dirty =
    trimmed(about) !== trimmed(profile.about) ||
    city.trim() !== (profile.city ?? "") ||
    country !== profile.country ||
    gender !== profile.gender ||
    birthDate !== (profile.birthDate ?? "")
  const document = mode === "preview" ? parseRichText(text) : null

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        update.mutate(
          {
            about: Object.fromEntries(
              Object.entries(about).flatMap(([code, value]) =>
                isSupportedLanguage(code) ? [[code, value?.trim() ?? ""]] : [],
              ),
            ),
            city: city.trim() === "" ? null : city.trim(),
            country,
            gender,
            birthDate: birthDate === "" ? null : birthDate,
          },
          {
            onSuccess: () => {
              toastManager.add({ title: m.profile_edit_saved(), type: "success" })
            },
          },
        )
      }}
    >
      <SettingsSection
        description={m.profile_edit_description()}
        footer={
          <div sx={settingsStyles.actions}>
            <Button disabled={!dirty} loading={update.isPending} type="submit">
              {m.profile_edit_save()}
            </Button>
          </div>
        }
        title={m.user_settings_about_title()}
      >
        <div sx={settingsStyles.form}>
          <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
          <Field>
            <div sx={styles.aboutHead}>
              <FieldLabel>{m.profile_edit_about()}</FieldLabel>
              <div sx={styles.aboutTools}>
                <SegmentedControl
                  aria-label={m.user_settings_about_mode()}
                  onValueChange={(value) => {
                    setMode(value === "preview" ? "preview" : "write")
                  }}
                  value={mode}
                >
                  <SegmentedControlItem size="sm" sx={styles.modeItem} value="write">
                    {m.user_settings_about_write()}
                  </SegmentedControlItem>
                  <SegmentedControlItem size="sm" sx={styles.modeItem} value="preview">
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
                  setAbout((current) => ({ ...current, [language]: event.target.value }))
                }}
                placeholder={m.profile_edit_about_placeholder()}
                rows={7}
                value={text}
              />
            ) : (
              <div sx={styles.preview}>
                {document.children.length === 0 ? (
                  <p sx={settingsStyles.muted}>{m.user_settings_about_preview_empty()}</p>
                ) : (
                  <RichText document={document} />
                )}
              </div>
            )}
            <FieldDescription>{m.user_settings_about_markdown()}</FieldDescription>
            <span sx={styles.counter}>
              {m.comments_counter({ count: text.length, max: ABOUT_MAX })}
            </span>
          </Field>
          <div sx={settingsStyles.row}>
            <Field>
              <FieldLabel>{m.profile_edit_city()}</FieldLabel>
              <Input
                maxLength={64}
                onChange={(event) => {
                  setCity(event.target.value)
                }}
                placeholder={m.profile_edit_city_placeholder()}
                value={city}
              />
            </Field>
            <Field>
              <FieldLabel>{m.profile_edit_country()}</FieldLabel>
              <CountryPicker onChange={setCountry} value={country} />
            </Field>
          </div>
          <div sx={settingsStyles.row}>
            <Field>
              <FieldLabel>{m.profile_edit_gender()}</FieldLabel>
              <Select
                onValueChange={(next: Gender | null) => {
                  if (next !== null) {
                    setGender(next)
                  }
                }}
                value={gender}
              >
                <SelectTrigger aria-label={m.profile_edit_gender()}>
                  <SelectValue>{() => GENDER_LABELS[gender]()}</SelectValue>
                </SelectTrigger>
                <SelectPopup>
                  {GENDERS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {GENDER_LABELS[option]()}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </Field>
            <Field>
              <FieldLabel>{m.profile_edit_birth_date()}</FieldLabel>
              <Input
                max={today}
                min="1900-01-01"
                onChange={(event) => {
                  setBirthDate(event.target.value)
                }}
                type="date"
                value={birthDate}
              />
            </Field>
          </div>
        </div>
      </SettingsSection>
    </form>
  )
}
