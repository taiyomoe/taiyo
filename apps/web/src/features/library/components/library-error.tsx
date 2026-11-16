import * as stylex from "@stylexjs/stylex"
import { AlertCircle } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  empty: {
    paddingBlock: "4rem",
  },
})

export function LibraryError({ onRetry }: { onRetry: () => void }) {
  return (
    <Empty sx={styles.empty}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>{m.library_error_title()}</EmptyTitle>
        <EmptyDescription>{m.library_error_description()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry} variant="outline">
          {m.library_retry()}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
