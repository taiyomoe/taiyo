import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import { Ellipsis } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Input } from "@taiyomoe/ui/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@taiyomoe/ui/components/ui/pagination"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId, useRef, useState } from "react"
import { getPageItems, parsePage } from "@/lib/pagination"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  content: {
    gap: { default: "0.125rem", "@media (width >= 40rem)": "0.25rem" },
    justifyContent: "center",
  },
  page: {
    paddingInline: "0.375rem",
    fontVariantNumeric: "tabular-nums",
    height: { default: null, "@media (width < 40rem)": "2rem" },
    minWidth: { default: "2.25rem", "@media (width < 40rem)": "2rem" },
    width: "auto",
  },
  edge: {
    height: { default: null, "@media (width < 40rem)": "2rem" },
    width: { default: null, "@media (width < 40rem)": "2rem" },
  },
  disabled: {
    opacity: 0.4,
    pointerEvents: "none",
  },
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

type PagePaginationProps = {
  page: number
  pageCount: number
  renderLink: (page: number) => ReactElement
  onJump: (page: number) => void
}

export function PagePagination({ page, pageCount, renderLink, onJump }: PagePaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  return (
    <Pagination aria-label={m.pagination_label()}>
      <PaginationContent sx={styles.content}>
        <PaginationItem {...stylex.props(page <= 1 && styles.disabled)}>
          <PaginationPrevious
            aria-disabled={page <= 1 || undefined}
            render={page <= 1 ? <span /> : renderLink(page - 1)}
            sx={styles.edge}
          />
        </PaginationItem>
        {getPageItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            <PaginationItem key={item}>
              <PaginationLink
                aria-label={m.pagination_page({ page: item })}
                isActive={item === page}
                render={renderLink(item)}
                sx={styles.page}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={`gap-${item.gapAfter}`}>
              <PageJump onJump={onJump} pageCount={pageCount} />
            </PaginationItem>
          ),
        )}
        <PaginationItem {...stylex.props(page >= pageCount && styles.disabled)}>
          <PaginationNext
            aria-disabled={page >= pageCount || undefined}
            render={page >= pageCount ? <span /> : renderLink(page + 1)}
            sx={styles.edge}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function PageJump({ pageCount, onJump }: { pageCount: number; onJump: (page: number) => void }) {
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
          <Button aria-label={m.pagination_jump()} size="icon" sx={styles.page} variant="ghost" />
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
