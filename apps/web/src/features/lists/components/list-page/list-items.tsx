import * as stylex from "@stylexjs/stylex"
import { EyeOff, List, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { range } from "remeda"
import type { ListDetail } from "@/features/lists/api/lists"
import { ListItemCard } from "@/features/lists/components/list-page/list-item-card"
import { listTitleCardStyles } from "@/features/lists/components/list-title-card"
import { CoverSkeleton } from "@/features/media/components/cover"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "1rem",
    display: "flex",
    flexDirection: "column",
  },
  hidden: {
    margin: 0,
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    fontSize: "0.875rem",
  },
  skeletonCover: {
    width: "100%",
  },
})

export function ListItems({ list, isOwner }: { list: ListDetail; isOwner: boolean }) {
  const hiddenNote =
    list.hiddenItemCount === 0 ? null : (
      <p sx={styles.hidden}>
        <EyeOff aria-hidden size={16} />
        {list.hiddenItemCount === 1
          ? m.list_hidden_items_one()
          : m.list_hidden_items({ count: list.hiddenItemCount })}
      </p>
    )

  if (list.items.length === 0) {
    return (
      <div sx={styles.root}>
        {hiddenNote}
        {list.hiddenItemCount > 0 ? null : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <List />
              </EmptyMedia>
              <EmptyTitle>{m.list_empty_title()}</EmptyTitle>
              <EmptyDescription>
                {isOwner ? m.list_empty_description_owner() : m.list_empty_description()}
              </EmptyDescription>
            </EmptyHeader>
            {isOwner ? (
              <EmptyContent>
                <Button
                  render={<Link params={{ listId: list.id }} to="/lists/$listId/edit" />}
                  size="sm"
                  variant="outline"
                >
                  <Plus />
                  {m.list_add_titles()}
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        )}
      </div>
    )
  }

  return (
    <div sx={styles.root}>
      {hiddenNote}
      <ol sx={listTitleCardStyles.grid}>
        {list.items.map((item, index) => (
          <ListItemCard item={item} key={item.mediaId} position={index + 1} />
        ))}
      </ol>
    </div>
  )
}

export function ListItemsSkeleton() {
  return (
    <div sx={listTitleCardStyles.grid}>
      {range(0, 12).map((index) => (
        <CoverSkeleton key={index} sx={styles.skeletonCover} />
      ))}
    </div>
  )
}
