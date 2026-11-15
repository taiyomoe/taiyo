import * as stylex from "@stylexjs/stylex"
import { Bell, BookOpenText, Comment, Search, ThumbsUp } from "@taiyomoe/ui/components/icons"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import type { NotificationCategory } from "@/features/notifications/api/notifications"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  compact: {
    flex: "1",
    paddingBlock: "2.5rem",
    paddingInline: "1.5rem",
  },
  query: {
    overflowWrap: "anywhere",
  },
})
const CATEGORY_EMPTY = {
  chapters: {
    icon: BookOpenText,
    title: m.notifications_empty_chapters,
    description: m.notifications_empty_chapters_description,
  },
  replies: {
    icon: Comment,
    title: m.notifications_empty_replies,
    description: m.notifications_empty_replies_description,
  },
  activity: {
    icon: ThumbsUp,
    title: m.notifications_empty_activity,
    description: m.notifications_empty_activity_description,
  },
} as const
const emptyStateOf = ({
  category,
  unread,
  query,
}: {
  category: NotificationCategory | undefined
  unread: boolean
  query: string
}) => {
  if (query !== "") {
    return {
      icon: Search,
      title: () => m.notifications_empty_search({ query }),
      description: m.notifications_empty_search_description,
    }
  }

  if (unread) {
    return {
      icon: Bell,
      title: m.notifications_empty_unread,
      description: m.notifications_empty_unread_description,
    }
  }

  return category === undefined
    ? { icon: Bell, title: m.notifications_empty, description: m.notifications_empty_description }
    : CATEGORY_EMPTY[category]
}

export function NotificationEmpty({
  category,
  unread = false,
  query = "",
  compact = false,
}: {
  category?: NotificationCategory | undefined
  unread?: boolean
  query?: string
  compact?: boolean
}) {
  const { icon: Icon, title, description } = emptyStateOf({ category, unread, query })

  return (
    <Empty sx={compact && styles.compact}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle sx={styles.query}>{title()}</EmptyTitle>
        <EmptyDescription>{description()}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
