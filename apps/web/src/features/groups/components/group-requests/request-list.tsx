import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { CheckCircle } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    gap: "1rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  skeleton: {
    borderRadius: radius.xxl,
    height: "14rem",
  },
})

type RequestListProps<T> = {
  items: T[] | undefined
  render: (item: T) => ReactNode
}

export function RequestList<T>({ items, render }: RequestListProps<T>) {
  if (items === undefined) {
    return <Skeleton sx={styles.skeleton} />
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle />
          </EmptyMedia>
          <EmptyTitle>{m.review_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.review_empty_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <ul sx={styles.list}>{items.map(render)}</ul>
}
