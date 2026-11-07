import { Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { controlStyles } from "@/features/advanced-search/components/control-styles"
import { useAdvancedSearch } from "@/features/advanced-search/hooks/use-advanced-search"
import { countActiveFilters } from "@/features/advanced-search/lib/advanced-search"
import { m } from "@/paraglide/messages"

export function ResultsEmpty() {
  const { search, reset } = useAdvancedSearch()
  const filtered = countActiveFilters(search) > 0

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>{m.search_empty_title()}</EmptyTitle>
        <EmptyDescription>
          {filtered ? m.search_empty_description_filtered() : m.search_empty_description()}
        </EmptyDescription>
      </EmptyHeader>
      {filtered ? (
        <EmptyContent>
          <Button
            onClick={() => {
              void reset()
            }}
            size="lg"
            sx={controlStyles.height}
            variant="outline"
          >
            {m.search_reset_filters()}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
