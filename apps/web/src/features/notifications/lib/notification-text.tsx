import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import { Fragment } from "react"
import type { Notification } from "@/features/notifications/api/notifications"
import { ACHIEVEMENT_LABELS } from "@/features/users/lib/achievement-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

type CommentTarget = Extract<Notification, { type: "COMMENT_REPLY" }>["comment"]["target"]
type Actors = Extract<Notification, { type: "FOLLOW" }>["actors"]
type Report = Extract<Notification, { type: "REPORT_REVIEWED" }>["report"]
type ProfileField = Extract<Notification, { type: "PROFILE_MODERATED" }>["fields"][number]

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
const richMessage = (template: string, values: Record<string, ReactNode>) => {
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
const Strong = ({ children }: { children: ReactNode }) => (
  <strong sx={styles.strong}>{children}</strong>
)
const targetLabel = (target: CommentTarget, viewerId: string) => {
  if (target.type === "USER") {
    return target.id === viewerId
      ? m.notifications_target_own_profile()
      : m.notifications_target_profile({ name: target.title ?? target.username ?? "" })
  }

  return target.title ?? m.notifications_target_unknown()
}
const targetNode = (target: CommentTarget, viewerId: string) => (
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
const PROFILE_FIELDS = {
  displayUsername: m.notifications_profile_field_display_name,
  about: m.notifications_profile_field_about,
  city: m.notifications_profile_field_city,
  avatar: m.notifications_profile_field_avatar,
  banner: m.notifications_profile_field_banner,
} satisfies Record<ProfileField, () => string>
/** What a report was about, named as precisely as what is left of it allows. */
const reportTargetNode = (report: Report, viewerId: string) => {
  if (report.kind === "PAGE") {
    return report.chapter === null
      ? m.notifications_report_page_unknown()
      : richMessage(m.notifications_report_page({ target: "{target}" }), {
          target: targetNode(
            {
              type: "CHAPTER",
              id: report.chapter.id,
              username: null,
              title: report.chapter.mediaTitle,
              chapterNumber: report.chapter.number,
            },
            viewerId,
          ),
        })
  }

  if (report.kind === "COMMENT") {
    const target = report.comment?.target ?? null

    return target === null
      ? m.notifications_report_comment_unknown()
      : richMessage(m.notifications_report_comment({ target: "{target}" }), {
          target: targetNode(target, viewerId),
        })
  }

  if (report.kind === "GROUP") {
    return report.group === null ? (
      m.notifications_report_group_unknown()
    ) : (
      <Strong>{report.group.name}</Strong>
    )
  }

  return report.user === null ? (
    m.notifications_report_profile_unknown()
  ) : (
    <Strong>{m.notifications_target_profile({ name: report.user.displayUsername })}</Strong>
  )
}
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
    count: <Strong>{(actors.count - 1).toLocaleString(getLocale())}</Strong>,
  })
}

/** The sentence of a reply, upvote, follow, ranking reward, achievement or moderation notification, with its names in bold. */
export const notificationText = (notification: Notification, viewerId: string) => {
  if (notification.type === "COMMENT_REPLY") {
    return richMessage(m.notifications_reply_text({ name: "{name}", target: "{target}" }), {
      name: <Strong>{notification.comment.author.displayUsername}</Strong>,
      target: targetNode(notification.comment.target, viewerId),
    })
  }

  if (notification.type === "COMMENT_LIKE") {
    const count = notification.upvoteCount.toLocaleString(getLocale())

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

  if (notification.type === "RANKING_REWARD") {
    const { ranking } = notification
    const template =
      ranking.period === "WEEK" ? m.notifications_ranking_week : m.notifications_ranking_month

    return richMessage(template({ rank: "{rank}", points: "{points}" }), {
      rank: (
        <Strong>
          {m.notifications_ranking_rank({ rank: ranking.rank.toLocaleString(getLocale()) })}
        </Strong>
      ),
      points: (
        <Strong>
          {m.notifications_points({ points: ranking.points.toLocaleString(getLocale()) })}
        </Strong>
      ),
    })
  }

  if (notification.type === "ACHIEVEMENT_EARNED") {
    const { achievement } = notification
    const name = <Strong>{ACHIEVEMENT_LABELS[achievement.key].name()}</Strong>

    return achievement.points === 0
      ? richMessage(m.notifications_achievement({ name: "{name}" }), { name })
      : richMessage(m.notifications_achievement_points({ name: "{name}", points: "{points}" }), {
          name,
          points: (
            <Strong>
              {m.notifications_points({ points: achievement.points.toLocaleString(getLocale()) })}
            </Strong>
          ),
        })
  }

  if (notification.type === "LIST_MODERATED") {
    const template =
      notification.action === "DELETED"
        ? m.notifications_list_deleted
        : m.notifications_list_updated

    return richMessage(template({ list: "{list}" }), {
      list: <Strong>{notification.list.name}</Strong>,
    })
  }

  if (notification.type === "PROFILE_MODERATED") {
    // Avatars and banners can only be removed, the other fields are edited.
    const template = notification.fields.every((field) => field === "avatar" || field === "banner")
      ? m.notifications_profile_removed
      : m.notifications_profile_changed
    const fields = new Intl.ListFormat(getLocale(), { type: "conjunction" }).format(
      notification.fields.map((field) => PROFILE_FIELDS[field]()),
    )

    return richMessage(template({ fields: "{fields}" }), { fields: <Strong>{fields}</Strong> })
  }

  if (notification.type === "REPORT_REVIEWED") {
    const { report } = notification
    const target = reportTargetNode(report, viewerId)

    if (report.points > 0) {
      return richMessage(
        m.notifications_report_resolved_points({ target: "{target}", points: "{points}" }),
        {
          target,
          points: (
            <Strong>
              {m.notifications_points({ points: report.points.toLocaleString(getLocale()) })}
            </Strong>
          ),
        },
      )
    }

    const template =
      report.outcome === "RESOLVED"
        ? m.notifications_report_resolved
        : m.notifications_report_dismissed

    return richMessage(template({ target: "{target}" }), { target })
  }

  return null
}
