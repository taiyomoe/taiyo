import * as stylex from "@stylexjs/stylex"
import { text } from "@taiyomoe/ui/styles/tokens.stylex"

import { DiscordButton } from "@/components/buttons/discord-button"
import { GoogleButton } from "@/components/buttons/google-button"
import { scene } from "@/components/scene/scene.stylex"

export type SocialProvider = "discord" | "google"

const styles = stylex.create({
  root: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  providers: {
    gap: "0.75rem",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  provider: {
    gap: "0.75rem",
    fontSize: text.lg,
    fontWeight: 500,
    height: "3rem",
  },
  divider: {
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
  },
  rule: {
    flex: "1",
    backgroundColor: `color-mix(in srgb, ${scene.paper} 10%, transparent)`,
    height: 1,
  },
  label: {
    color: `color-mix(in srgb, ${scene.paper} 40%, transparent)`,
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
})

export const AuthSocialButtons = ({
  label,
  pending,
  disabled,
  onSelect,
}: {
  label: string
  pending: SocialProvider | null
  disabled: boolean
  onSelect: (provider: SocialProvider) => void
}) => (
  <div sx={styles.root}>
    <div sx={styles.providers}>
      <GoogleButton
        sx={styles.provider}
        loading={pending === "google"}
        disabled={disabled}
        onClick={() => onSelect("google")}
      />
      <DiscordButton
        sx={styles.provider}
        loading={pending === "discord"}
        disabled={disabled}
        onClick={() => onSelect("discord")}
      />
    </div>
    <div sx={styles.divider}>
      <span sx={styles.rule} />
      <span sx={styles.label}>{label}</span>
      <span sx={styles.rule} />
    </div>
  </div>
)
