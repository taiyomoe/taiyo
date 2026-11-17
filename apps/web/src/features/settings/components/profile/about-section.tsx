import * as stylex from "@stylexjs/stylex"
import { GENDERS, type Gender } from "@taiyomoe/db/constants"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useState } from "react"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { type UserProfile, useUpdateProfile } from "@/features/users/api/profile"
import {
  AboutField,
  type AboutText,
  isSameAbout,
  toAboutPayload,
} from "@/features/users/components/profile/about-field"
import { CountryPicker } from "@/features/users/components/profile/dialogs/country-picker"
import { GENDER_LABELS } from "@/features/users/lib/cosmetic-labels"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

export function AboutSection({ profile }: { profile: UserProfile }) {
  const update = useUpdateProfile(profile.username)
  const [about, setAbout] = useState<AboutText>(profile.about)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const [city, setCity] = useState(profile.city ?? "")
  const [country, setCountry] = useState(profile.country)
  const [gender, setGender] = useState<Gender>(profile.gender)
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "")
  const dirty =
    !isSameAbout(about, profile.about) ||
    city.trim() !== (profile.city ?? "") ||
    country !== profile.country ||
    gender !== profile.gender ||
    birthDate !== (profile.birthDate ?? "")

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        update.mutate(
          {
            about: toAboutPayload(about),
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
        <div {...stylex.props(settingsStyles.form)}>
          <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
          <AboutField
            about={about}
            label={m.profile_edit_about()}
            onChange={setAbout}
            placeholder={m.profile_edit_about_placeholder()}
          />
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
