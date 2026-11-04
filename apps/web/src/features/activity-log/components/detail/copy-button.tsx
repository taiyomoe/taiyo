// StyleX only compiles the `sx` props of files that import it.
// oxlint-disable-next-line no-unused-vars
import * as stylex from "@stylexjs/stylex"
import { Check, Copy } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { useState } from "react"
import { detailStyles } from "@/features/activity-log/components/detail/detail-styles"

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      aria-label={label}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
          }, 1500)
        })
      }}
      size="icon-xs"
      sx={detailStyles.action}
      variant="ghost"
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}
