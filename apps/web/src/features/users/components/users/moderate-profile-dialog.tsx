import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Trash } from "@taiyomoe/ui/components/icons"
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
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { NameEffectProp } from "@/components/user-name/user-name"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { renderWithName } from "@/components/user-name/with-name"
import {
  type ProfileImageKind,
  type UserProfile,
  useModerateProfile,
  useRemoveUserImage,
  userProfileQueryOptions,
} from "@/features/users/api/profile"
import {
  AboutField,
  type AboutText,
  isSameAbout,
  toAboutPayload,
} from "@/features/users/components/profile/about-field"
import { ProfileImagesPreview } from "@/features/users/components/profile/profile-images-preview"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

/** The user whose profile staff edit: enough to name them and load their profile. */
export type ModeratedUser = {
  id: string
  username: string
  displayUsername: string
  nameEffect: NameEffectProp
}

const CITY_MAX = 64
const REMOVALS = {
  avatar: {
    title: m.user_moderation_remove_avatar_title,
    description: m.user_moderation_remove_avatar_description,
    confirm: m.profile_remove_avatar,
    done: m.profile_avatar_removed,
  },
  banner: {
    title: m.user_moderation_remove_banner_title,
    description: m.user_moderation_remove_banner_description,
    confirm: m.profile_remove_banner,
    done: m.profile_banner_removed,
  },
}
const styles = stylex.create({
  popup: {
    maxWidth: "40rem",
  },
  title: {
    overflowWrap: "anywhere",
  },
  form: {
    display: "contents",
  },
  fields: {
    gap: "1.125rem",
    display: "flex",
    flexDirection: "column",
  },
  images: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  buttons: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  muted: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  bannerSkeleton: {
    borderRadius: radius.xl,
    aspectRatio: "3 / 1",
    width: "100%",
  },
  fieldSkeleton: {
    borderRadius: radius.lg,
    height: "2.25rem",
  },
  aboutSkeleton: {
    borderRadius: radius.xl,
    height: "10rem",
  },
})

/** Lets staff fix a profile that breaks the rules: its name, about text and city, and remove its images. */
export function ModerateProfileDialog({
  user,
  onClose,
}: {
  user: ModeratedUser | null
  onClose: () => void
}) {
  // Keeps the profile on screen while the dialog closes, then forgets it so the next opening starts afresh.
  const [shown, setShown] = useState(user)

  if (user !== null && user !== shown) {
    setShown(user)
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setShown(null)
        }
      }}
      open={user !== null}
    >
      <DialogPopup sx={styles.popup}>
        {shown === null ? null : <ModerateProfile key={shown.id} onDone={onClose} user={shown} />}
      </DialogPopup>
    </Dialog>
  )
}

function ModerateProfile({ user, onDone }: { user: ModeratedUser; onDone: () => void }) {
  const { data: profile, error } = useQuery(userProfileQueryOptions(user.username))

  return (
    <>
      <DialogHeader>
        <DialogTitle sx={styles.title}>{renderWithName(m.user_moderation_title, user)}</DialogTitle>
        <DialogDescription>{m.user_moderation_description()}</DialogDescription>
      </DialogHeader>
      {profile === undefined ? (
        <>
          <DialogPanel>
            {error === null ? (
              <div sx={styles.fields}>
                <Skeleton sx={styles.bannerSkeleton} />
                <Skeleton sx={styles.fieldSkeleton} />
                <Skeleton sx={styles.aboutSkeleton} />
                <Skeleton sx={styles.fieldSkeleton} />
              </div>
            ) : (
              <ErrorAlert
                message={getErrorMessage(error, { USER_NOT_FOUND: m.user_moderation_not_found })}
              />
            )}
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
          </DialogFooter>
        </>
      ) : (
        <ModerateProfileForm onDone={onDone} profile={profile} />
      )}
    </>
  )
}

function ModerateProfileForm({ profile, onDone }: { profile: UserProfile; onDone: () => void }) {
  const save = useModerateProfile(profile)
  const removals = {
    avatar: useRemoveUserImage(profile, "avatar"),
    banner: useRemoveUserImage(profile, "banner"),
  }
  const [displayName, setDisplayName] = useState(profile.displayUsername)
  const [about, setAbout] = useState<AboutText>(profile.about)
  const [city, setCity] = useState(profile.city ?? "")
  const [touched, setTouched] = useState(false)
  const [removing, setRemoving] = useState<ProfileImageKind | null>(null)
  const name = displayName.trim()
  const renamed = name !== profile.displayUsername
  const nameInvalid = renamed && !config.auth.displayName.regex.test(name)
  const patch = {
    ...(renamed ? { displayUsername: name } : {}),
    ...(isSameAbout(about, profile.about) ? {} : { about: toAboutPayload(about) }),
    ...(city.trim() === (profile.city ?? "")
      ? {}
      : { city: city.trim() === "" ? null : city.trim() }),
  }
  const removal = removing === null ? null : removals[removing]

  return (
    <>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setTouched(true)

          if (!nameInvalid) {
            save.mutate(patch, {
              onSuccess: (updated) => {
                toastManager.add({
                  title: m.user_moderation_saved({ name: updated.displayUsername }),
                  type: "success",
                })
                onDone()
              },
            })
          }
        }}
        sx={styles.form}
      >
        <DialogPanel>
          <div sx={styles.fields}>
            <ErrorAlert
              message={
                save.isError
                  ? getErrorMessage(save.error, {
                      DISPLAY_NAME_TAKEN: m.user_settings_display_name_taken,
                    })
                  : null
              }
            />
            <div sx={styles.images}>
              <ProfileImagesPreview profile={profile} />
              <div sx={styles.buttons}>
                {profile.image === null ? null : (
                  <Button
                    onClick={() => {
                      setRemoving("avatar")
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash />
                    {m.profile_remove_avatar()}
                  </Button>
                )}
                {profile.bannerUrl === null ? null : (
                  <Button
                    onClick={() => {
                      setRemoving("banner")
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trash />
                    {m.profile_remove_banner()}
                  </Button>
                )}
                {profile.image === null && profile.bannerUrl === null ? (
                  <p sx={styles.muted}>{m.user_moderation_no_images()}</p>
                ) : null}
              </div>
            </div>
            <Field invalid={touched && nameInvalid}>
              <FieldLabel>{m.user_settings_display_name()}</FieldLabel>
              <Input
                autoComplete="off"
                maxLength={config.auth.displayName.maxLength}
                onBlur={() => {
                  setTouched(true)
                }}
                onChange={(event) => {
                  setDisplayName(event.target.value)
                }}
                value={displayName}
              />
              {touched && nameInvalid ? (
                <FieldError match>{m.user_settings_display_name_invalid()}</FieldError>
              ) : (
                <FieldDescription>{m.user_settings_display_name_hint()}</FieldDescription>
              )}
            </Field>
            <AboutField about={about} label={m.profile_about()} onChange={setAbout} />
            <Field>
              <FieldLabel>{m.profile_edit_city()}</FieldLabel>
              <Input
                autoComplete="off"
                maxLength={CITY_MAX}
                onChange={(event) => {
                  setCity(event.target.value)
                }}
                value={city}
              />
            </Field>
          </div>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            {m.cancel()}
          </DialogClose>
          <Button disabled={Object.keys(patch).length === 0} loading={save.isPending} type="submit">
            {m.profile_edit_save()}
          </Button>
        </DialogFooter>
      </form>
      <ConfirmDialog
        confirmation={
          removing === null
            ? null
            : {
                title: renderWithName(REMOVALS[removing].title, profile),
                description: REMOVALS[removing].description(),
                confirmLabel: REMOVALS[removing].confirm(),
                destructive: true,
                run: async () => {
                  await removals[removing].mutateAsync()
                  toastManager.add({ title: REMOVALS[removing].done(), type: "success" })
                },
              }
        }
        error={removal?.isError === true ? getErrorMessage(removal.error) : null}
        onClose={() => {
          setRemoving(null)
          removal?.reset()
        }}
        pending={removal?.isPending === true}
      />
    </>
  )
}
