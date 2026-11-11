import { Check, Share } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { Group } from "@/features/groups/api/groups"
import { useCopy } from "@/hooks/use-copy"
import { m } from "@/paraglide/messages"

export function ShareGroupButton({
  group,
  size = "icon-lg",
}: {
  group: Group
  size?: "icon" | "icon-lg"
}) {
  const { copied, copy } = useCopy()
  const label = copied ? m.group_share_copied() : m.group_share()

  return (
    <Button
      aria-label={label}
      onClick={() => {
        const url = window.location.origin + window.location.pathname

        if (typeof navigator.share === "function" && matchMedia("(pointer: coarse)").matches) {
          void navigator.share({ title: group.name, url }).catch(() => {})
        } else {
          copy(url)
        }
      }}
      size={size}
      title={label}
      variant="outline"
    >
      {copied ? <Check /> : <Share />}
    </Button>
  )
}
