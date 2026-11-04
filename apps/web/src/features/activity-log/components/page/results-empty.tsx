import * as stylex from "@stylexjs/stylex"
import { History } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import type { UpdateSearch } from "@/features/activity-log/hooks/use-activity-log"
import { DEFAULT_QUERY } from "@/features/activity-log/lib/activity-log"
import { m } from "@/paraglide/messages"

const WIDER_RANGES = [
  { from: "now-7d", span: 604_800_000, label: m.activity_empty_widen_7d },
  { from: "now-30d", span: 2_592_000_000, label: m.activity_empty_widen_30d },
  { from: "now-1y", span: 31_536_000_000, label: m.activity_empty_widen_1y },
]
const styles = stylex.create({
  emptyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: "none",
  },
})

export function ResultsEmpty({
  query,
  span,
  onUpdate,
}: {
  query: string
  span: number
  onUpdate: UpdateSearch
}) {
  const wider = WIDER_RANGES.find((option) => option.span > span + 60_000)
  const queried = query.trim() !== "" && query !== DEFAULT_QUERY

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <History />
        </EmptyMedia>
        <EmptyTitle>{m.activity_empty_title()}</EmptyTitle>
        <EmptyDescription>{m.activity_empty_description()}</EmptyDescription>
      </EmptyHeader>
      {queried || wider !== undefined ? (
        <EmptyContent sx={styles.emptyActions}>
          {queried ? (
            <Button
              onClick={() => {
                onUpdate({ q: undefined })
              }}
              variant="outline"
            >
              {m.activity_empty_clear_query()}
            </Button>
          ) : null}
          {wider === undefined ? null : (
            <Button
              onClick={() => {
                onUpdate({ from: wider.from, to: "now" })
              }}
              variant="outline"
            >
              {wider.label()}
            </Button>
          )}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
