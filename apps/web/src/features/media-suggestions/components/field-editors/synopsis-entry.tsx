import type { Language } from "@taiyomoe/db/constants"
import * as stylex from "@stylexjs/stylex"
import { config } from "@taiyomoe/config"
import { Close } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { getLanguageName, LanguageFlag } from "@/components/flags/flags"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  synopsisLabel: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  languageName: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
})

export function SynopsisEntry({
  language,
  value,
  onChange,
  onRemove,
}: {
  language: Language
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}) {
  return (
    <Field>
      <div sx={styles.synopsisLabel}>
        <FieldLabel>
          <span sx={styles.languageName}>
            <LanguageFlag language={language} />
            {getLanguageName(language)}
          </span>
        </FieldLabel>
        <Button
          aria-label={m.media_edit_remove()}
          onClick={onRemove}
          size="icon-sm"
          variant="ghost"
        >
          <Close />
        </Button>
      </div>
      <Textarea
        maxLength={config.input.maxSynopsisLength}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        rows={6}
        value={value}
      />
    </Field>
  )
}
