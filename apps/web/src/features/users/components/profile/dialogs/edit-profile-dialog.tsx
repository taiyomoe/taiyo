import * as stylex from "@stylexjs/stylex"
import { GENDERS, type Gender, type Language, LANGUAGES } from "@taiyomoe/db/constants"
import { Button } from "@taiyomoe/ui/components/ui/button"
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
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints, colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { LanguagePicker } from "@/components/fields/language-picker"
import { type UserProfile, useUpdateProfile } from "@/features/users/api/profile"
import { CountryPicker } from "@/features/users/components/profile/dialogs/country-picker"
import { GENDER_LABELS } from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

const ABOUT_MAX = 2000
const styles = stylex.create({
  contents: {
    display: "contents",
  },
  form: {
    gap: "1.125rem",
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.sm]: "repeat(2, minmax(0, 1fr))",
    },
  },
  aboutHead: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  language: {
    width: "12rem",
  },
  counter: {
    alignSelf: "flex-end",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    fontVariantNumeric: "tabular-nums",
  },
})
const isLanguage = (value: string): value is Language => LANGUAGES.some((code) => code === value)

export function EditProfileDialog({
  profile,
  onClose,
}: {
  profile: UserProfile
  onClose: () => void
}) {
  const update = useUpdateProfile(profile.username)
  const locale = getLocale()
  const [language, setLanguage] = useState<Language>(() => {
    const existing = Object.keys(profile.about).find(isLanguage)

    return isLanguage(locale) && (existing === undefined || locale in profile.about)
      ? locale
      : (existing ?? "en")
  })
  const [about, setAbout] = useState<Partial<Record<Language, string | undefined>>>(profile.about)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [city, setCity] = useState(profile.city ?? "")
  const [country, setCountry] = useState(profile.country)
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "")
  const text = about[language] ?? ""

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogPopup>
        <form
          sx={styles.contents}
          onSubmit={(event) => {
            event.preventDefault()
            update.mutate(
              {
                about: Object.fromEntries(
                  Object.entries(about).map(([code, value]) => [code, value?.trim() ?? ""]),
                ),
                city: city.trim() === "" ? null : city.trim(),
                country,
                gender,
                birthDate: birthDate === "" ? null : birthDate,
              },
              {
                onSuccess: () => {
                  toastManager.add({ title: m.profile_edit_saved(), type: "success" })
                  onClose()
                },
              },
            )
          }}
        >
          <DialogHeader>
            <DialogTitle>{m.profile_edit_title()}</DialogTitle>
            <DialogDescription>{m.profile_edit_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={styles.form}>
              <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
              <Field>
                <div sx={styles.aboutHead}>
                  <FieldLabel>{m.profile_edit_about()}</FieldLabel>
                  <div sx={styles.language}>
                    <LanguagePicker onChange={setLanguage} value={language} />
                  </div>
                </div>
                <Textarea
                  maxLength={ABOUT_MAX}
                  onChange={(event) => {
                    setAbout((current) => ({ ...current, [language]: event.target.value }))
                  }}
                  placeholder={m.profile_edit_about_placeholder()}
                  rows={5}
                  value={text}
                />
                <span sx={styles.counter}>
                  {m.profile_comments_counter({ count: text.length, max: ABOUT_MAX })}
                </span>
              </Field>
              <div sx={styles.row}>
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
              <div sx={styles.row}>
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
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button loading={update.isPending} type="submit">
              {m.profile_edit_save()}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
