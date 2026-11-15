import * as stylex from "@stylexjs/stylex"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, font, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import { m } from "@/paraglide/messages"

const EXAMPLES = [
  "actor: admin",
  "category: media and not outcome: success",
  "severity >= high",
  "action: media.*",
  "outcome: (failure or denied)",
  "changed: role",
  "target.mediaId: *",
  '"Moonlit Garden"',
]
const styles = stylex.create({
  syntax: {
    borderRadius: radius.md,
    paddingBlock: "0.25rem",
    paddingInline: "0.5rem",
    backgroundColor: {
      default: colors.chip,
      ":hover": colors.chipHover,
    },
    boxShadow: shadows.chip,
    color: colors.mutedForeground,
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: font.mono,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    marginTop: "0.5rem",
  },
  help: {
    padding: "0.25rem",
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
    width: "min(26rem, calc(100vw - 2rem))",
  },
  helpTitle: {
    margin: 0,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  helpText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  examples: {
    margin: 0,
    padding: 0,
    gap: "0.125rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  example: {
    borderRadius: radius.md,
    borderWidth: 0,
    paddingBlock: "0.5rem",
    paddingInline: "0.625rem",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.accent,
    },
    color: colors.foreground,
    cursor: "pointer",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    textAlign: "start",
    width: "100%",
  },
})

export function KqlSyntaxHelp({
  onChange,
  onSubmit,
}: {
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger aria-label={m.activity_syntax_label()} sx={styles.syntax}>
        KQL
      </PopoverTrigger>
      <PopoverPopup align="end">
        <div sx={styles.help}>
          <p sx={styles.helpTitle}>{m.activity_syntax_title()}</p>
          <p sx={styles.helpText}>{m.activity_syntax_body()}</p>
          <ul sx={styles.examples}>
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button
                  onClick={() => {
                    setOpen(false)
                    onChange(example)
                    onSubmit(example)
                  }}
                  sx={styles.example}
                  type="button"
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </PopoverPopup>
    </Popover>
  )
}
