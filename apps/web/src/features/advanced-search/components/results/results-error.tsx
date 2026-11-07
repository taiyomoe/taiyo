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
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { controlStyles } from "@/features/advanced-search/components/control-styles"
import { m } from "@/paraglide/messages"

export function ResultsError({ reset: retry }: { reset: () => void }) {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertCircle />
        </EmptyMedia>
        <EmptyTitle>{m.search_error_title()}</EmptyTitle>
        <EmptyDescription>{m.search_error_description()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={() => {
            reset()
            retry()
          }}
          size="lg"
          sx={controlStyles.height}
          variant="outline"
        >
          {m.search_error_retry()}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
