import * as stylex from "@stylexjs/stylex"
import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useRef, useState } from "react"
import { paginationStyles } from "@/components/pagination/pagination-styles"
import { parsePage } from "@/lib/pagination"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  form: {
    gap: "0.625rem",
    display: "flex",
    flexDirection: "column",
    width: "13rem",
  },
  label: {
    color: colors.foreground,
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  row: {
    gap: "0.5rem",
    display: "flex",
  },
  field: {
    flexGrow: 1,
    minWidth: 0,
  },
  hint: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
  },
  error: {
    color: colors.destructiveForeground,
  },
})

export function PageJump({
  pageCount,
  onJump,
}: {
  pageCount: number
  onJump: (page: number) => void
}) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const target = parsePage(input, pageCount)
  const invalid = input !== "" && target === null

  return (
    <Popover
      onOpenChange={(next) => {
        setOpen(next)

        if (next) {
          setInput("")
        }
      }}
      open={open}
    >
      <PopoverTrigger
        render={
          <Button
            aria-label={m.pagination_jump()}
            size="icon"
            sx={paginationStyles.page}
            variant="ghost"
          />
        }
      >
        <Ellipsis />
      </PopoverTrigger>
      <PopoverPopup arrow initialFocus={inputRef} side="top">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()

            if (target !== null) {
              setOpen(false)
              onJump(target)
            }
          }}
          sx={styles.form}
        >
          <label htmlFor={id} sx={styles.label}>
            {m.pagination_jump()}
          </label>
          <div sx={styles.row}>
            <Input
              ref={inputRef}
              aria-describedby={`${id}-hint`}
              aria-invalid={invalid || undefined}
              autoComplete="off"
              enterKeyHint="go"
              id={id}
              inputMode="numeric"
              maxLength={String(pageCount).length}
              nativeInput
              onChange={(event) => {
                setInput(event.target.value.replace(/\D/g, "").replace(/^0+/, ""))
              }}
              placeholder={`1–${pageCount}`}
              size="sm"
              sx={styles.field}
              value={input}
            />
            <Button disabled={target === null} size="sm" type="submit">
              {m.pagination_jump_go()}
            </Button>
          </div>
          <p id={`${id}-hint`} sx={[styles.hint, invalid && styles.error]}>
            {m.pagination_jump_hint({ count: pageCount })}
          </p>
        </form>
      </PopoverPopup>
    </Popover>
  )
}
