import * as stylex from "@stylexjs/stylex"
import { ChevronLeft, ChevronRight } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@taiyomoe/ui/components/ui/select"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gap: "0.375rem",
    alignItems: "center",
    display: "flex",
  },
  trigger: {
    flexGrow: 1,
    minWidth: 0,
  },
})

export function PageSelect({
  page,
  pageCount,
  onSelect,
}: {
  page: number
  pageCount: number
  onSelect: (index: number) => void
}) {
  return (
    <div sx={styles.row}>
      <Button
        aria-label={m.reader_prev_page()}
        disabled={page <= 0}
        onClick={() => {
          onSelect(page - 1)
        }}
        size="icon-xl"
        title={m.reader_prev_page()}
        variant="outline"
      >
        <ChevronLeft />
      </Button>
      <Select
        onValueChange={(value) => {
          if (value !== null) {
            onSelect(value)
          }
        }}
        value={page}
      >
        <SelectTrigger aria-label={m.reader_page()} sx={styles.trigger}>
          <SelectValue>{() => m.reader_page_of({ page: page + 1, total: pageCount })}</SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {Array.from({ length: pageCount }, (_, index) => (
            <SelectItem key={index} value={index}>
              {m.reader_page_label({ page: index + 1 })}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
      <Button
        aria-label={m.reader_next_page()}
        disabled={page >= pageCount - 1}
        onClick={() => {
          onSelect(page + 1)
        }}
        size="icon-xl"
        title={m.reader_next_page()}
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
