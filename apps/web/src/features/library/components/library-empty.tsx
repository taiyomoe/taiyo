import * as stylex from "@stylexjs/stylex"
import { Library, Search } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Link } from "@tanstack/react-router"
import type { LibraryStatus } from "@/features/library/api/library"
import {
  LIBRARY_STATUS_ICONS,
  LIBRARY_STATUS_LABELS,
  libraryStatusTones,
} from "@/features/library/lib/library-statuses"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  empty: {
    paddingBlock: "4rem",
  },
  title: {
    overflowWrap: "anywhere",
  },
})

export function LibraryEmpty({
  status,
  query,
}: {
  status: LibraryStatus | undefined
  query: string
}) {
  if (query !== "") {
    return (
      <Empty sx={styles.empty}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search />
          </EmptyMedia>
          <EmptyTitle sx={styles.title}>{m.library_empty_search_title({ query })}</EmptyTitle>
          <EmptyDescription>{m.library_empty_search_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (status !== undefined) {
    const Icon = LIBRARY_STATUS_ICONS[status]

    return (
      <Empty sx={styles.empty}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon {...stylex.props(libraryStatusTones[status])} />
          </EmptyMedia>
          <EmptyTitle>
            {m.library_empty_status_title({ status: LIBRARY_STATUS_LABELS[status]() })}
          </EmptyTitle>
          <EmptyDescription>{m.library_empty_status_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Empty sx={styles.empty}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Library />
        </EmptyMedia>
        <EmptyTitle>{m.library_empty_title()}</EmptyTitle>
        <EmptyDescription>{m.library_empty_description()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link to="/titles" />}>{m.library_empty_browse()}</Button>
      </EmptyContent>
    </Empty>
  )
}
