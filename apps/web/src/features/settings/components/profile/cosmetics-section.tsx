import * as stylex from "@stylexjs/stylex"
import { Sparkles } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { lazy, Suspense, useState } from "react"
import type { UserProfile } from "@/features/users/api/profile"
import { UserName } from "@/components/user-name/user-name"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { TitleBadge } from "@/features/users/components/profile/title-badge"
import { m } from "@/paraglide/messages"

const CustomizeDialog = lazy(async () => ({
  default: (await import("@/features/users/components/profile/dialogs/customize-dialog"))
    .CustomizeDialog,
}))
const styles = stylex.create({
  preview: {
    gap: "0.625rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    fontSize: "1.25rem",
    fontWeight: font.weightBold,
  },
  empty: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function CosmeticsSection({ profile }: { profile: UserProfile }) {
  const [open, setOpen] = useState(false)

  return (
    <SettingsSection
      action={
        <Button
          onClick={() => {
            setOpen(true)
          }}
          size="sm"
          variant="outline"
        >
          <Sparkles />
          {m.profile_customize()}
        </Button>
      }
      description={m.profile_customize_description()}
      title={m.user_settings_cosmetics_title()}
    >
      <div sx={styles.preview}>
        <UserName effect={profile.nameEffect} name={profile.displayUsername} sx={styles.name} />
        {profile.title === null ? (
          <span sx={styles.empty}>{m.profile_customize_no_title()}</span>
        ) : (
          <TitleBadge title={profile.title} />
        )}
      </div>
      {open ? (
        <Suspense>
          <CustomizeDialog
            onClose={() => {
              setOpen(false)
            }}
            profile={profile}
          />
        </Suspense>
      ) : null}
    </SettingsSection>
  )
}
