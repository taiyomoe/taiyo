import * as stylex from "@stylexjs/stylex"
import { Book } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import type { ReadingProgress } from "@/features/media/api/library"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  cta: {
    width: "100%",
  },
})

type ReadButtonProps = {
  progress: ReadingProgress | null
}

export function ReadButton({ progress }: ReadButtonProps) {
  const next = progress?.next ?? null
  let label = next === null ? m.media_caught_up() : m.media_continue({ number: next.number })

  if ((progress?.lastRead ?? null) === null) {
    label = m.media_start_reading()
  }

  return (
    <span title={m.media_reader_soon()}>
      <Button disabled size="lg" sx={styles.cta}>
        <Book />
        {label}
      </Button>
    </span>
  )
}
