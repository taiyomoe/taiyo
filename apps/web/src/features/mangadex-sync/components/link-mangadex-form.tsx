import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { useState } from "react"
import { parseMangaDexId } from "@/features/mangadex-sync/lib/mangadex-id"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  form: {
    gap: "0.75rem",
    alignItems: "flex-end",
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
  },
  field: {
    flexBasis: "18rem",
    flexGrow: 1,
    minWidth: 0,
  },
})

export function LinkMangaDexForm({ onLink }: { onLink: (mangaDexId: string) => void }) {
  const [draft, setDraft] = useState("")
  const [invalid, setInvalid] = useState(false)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        const id = parseMangaDexId(draft)

        setInvalid(id === null)

        if (id !== null) {
          onLink(id)
        }
      }}
      sx={styles.form}
    >
      <Field invalid={invalid} sx={styles.field}>
        <FieldLabel>{m.mangadex_link_label()}</FieldLabel>
        <Input
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          placeholder="https://mangadex.org/title/…"
          value={draft}
        />
        {invalid ? (
          <FieldError match>{m.mangadex_link_invalid()}</FieldError>
        ) : (
          <FieldDescription>{m.mangadex_link_hint()}</FieldDescription>
        )}
      </Field>
      <Button type="submit">{m.mangadex_link_submit()}</Button>
    </form>
  )
}
