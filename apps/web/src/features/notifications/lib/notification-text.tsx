import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Fragment } from "react"
import type { Notification } from "@/features/notifications/api/notifications"
import { m } from "@/paraglide/messages"

type CommentTarget = Extract<Notification, { type: "COMMENT_REPLY" }>["comment"]["target"]
type Actors = Extract<Notification, { type: "FOLLOW" }>["actors"]

const styles = stylex.create({
  strong: {
    color: colors.foreground,
    fontWeight: 650,
  },
  chapter: {
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.92em",
    fontWeight: 400,
    whiteSpace: "nowrap",
  },
})

/**
 * Fills a message whose placeholders are rich. The message is rendered with each
 * placeholder kept as `{name}`, then split on them, so translations keep their word order.
 */
export const richMessage = (template: string, values: Record<string, ReactNode>) => {
  let offset = 0
  const nodes = new Map(Object.entries(values))

  return template
    .split(/(\{\w+\})/)
    .filter((part) => part !== "")
    .map((part) => {
      const key = /^\{(\w+)\}$/.exec(part)?.[1]
      const start = offset

      offset += part.length

      return <Fragment key={start}>{key === undefined ? part : nodes.get(key)}</Fragment>
    })
}

export const Strong = ({ children }: { children: ReactNode }) => (
  <strong sx={styles.strong}>{children}</strong>
)

export const targetLabel = (target: CommentTarget, viewerId: string) => {
  if (target.type === "USER") {
    return target.id === viewerId
      ? m.notifications_target_own_profile()
      : m.notifications_target_profile({ name: target.title ?? target.username ?? "" })
  }

  return target.title ?? m.notifications_target_unknown()
}

export const targetNode = (target: CommentTarget, viewerId: string) => (
  <>
    <Strong>{targetLabel(target, viewerId)}</Strong>
    {target.chapterNumber === null ? null : (
      <>
        {" "}
        <span sx={styles.chapter}>
          {m.notifications_chapter_number({ number: target.chapterNumber })}
        </span>
      </>
    )}
  </>
)

/** "Sora", "Sora and Mina", "Sora and 13 others": the people behind a gathered notification. */
const actorsText = (
  actors: Actors,
  templates: { one: () => string; two: () => string; many: () => string },
  extra: Record<string, ReactNode> = {},
) => {
  const [first, second] = actors.latest
  const name = <Strong>{first?.displayUsername ?? ""}</Strong>

  if (actors.count === 1 || first === undefined) {
    return richMessage(templates.one(), { ...extra, name })
  }

  if (actors.count === 2 && second !== undefined) {
    return richMessage(templates.two(), {
      ...extra,
      name,
      other: <Strong>{second.displayUsername}</Strong>,
    })
  }

  return richMessage(templates.many(), {
    ...extra,
    name,
    count: <Strong>{(actors.count - 1).toLocaleString()}</Strong>,
  })
}

/** The sentence of a reply, upvote or follow notification, with its names in bold. */
export const notificationText = (notification: Notification, viewerId: string) => {
  if (notification.type === "COMMENT_REPLY") {
    return richMessage(m.notifications_reply_text({ name: "{name}", target: "{target}" }), {
      name: <Strong>{notification.comment.author.displayUsername}</Strong>,
      target: targetNode(notification.comment.target, viewerId),
    })
  }

  if (notification.type === "COMMENT_LIKE") {
    const count = notification.upvoteCount.toLocaleString()

    return richMessage(m.notifications_upvotes({ readers: "{readers}", target: "{target}" }), {
      readers: (
        <Strong>
          {notification.upvoteCount === 1
            ? m.notifications_readers_one({ count })
            : m.notifications_readers_many({ count })}
        </Strong>
      ),
      target: targetNode(notification.comment.target, viewerId),
    })
  }

  if (notification.type === "FOLLOW") {
    return actorsText(notification.actors, {
      one: () => m.notifications_follows_one({ name: "{name}" }),
      two: () => m.notifications_follows_two({ name: "{name}", other: "{other}" }),
      many: () => m.notifications_follows_many({ name: "{name}", count: "{count}" }),
    })
  }

  return null
}
