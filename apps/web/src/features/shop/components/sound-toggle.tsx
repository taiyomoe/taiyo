import { Volume, VolumeOff } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { m } from "@/paraglide/messages"

export function SoundToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <Button
      aria-label={enabled ? m.shop_sound_off() : m.shop_sound_on()}
      aria-pressed={enabled}
      onClick={onToggle}
      size="icon-sm"
      title={enabled ? m.shop_sound_off() : m.shop_sound_on()}
      variant="ghost"
    >
      {enabled ? <Volume size={18} /> : <VolumeOff size={18} />}
    </Button>
  )
}
