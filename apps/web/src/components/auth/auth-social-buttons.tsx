import { DiscordButton } from "@/components/buttons/discord-button"
import { GoogleButton } from "@/components/buttons/google-button"

export type SocialProvider = "discord" | "google"

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
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-2 gap-3">
      <GoogleButton
        className="h-12! gap-3 text-lg! font-semibold"
        loading={pending === "google"}
        disabled={disabled}
        onClick={() => onSelect("google")}
      />
      <DiscordButton
        className="h-12! gap-3 text-lg! font-semibold"
        loading={pending === "discord"}
        disabled={disabled}
        onClick={() => onSelect("discord")}
      />
    </div>
    <div className="flex items-center gap-3.5">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs font-bold tracking-[0.08em] text-white/40 uppercase">{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  </div>
)
