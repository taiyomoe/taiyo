import type { GroupsRanking, ReadersRanking, TitlesRanking } from "@/features/rankings/api/rankings"
import type { RankingCategory } from "@/features/rankings/lib/rankings"
import { MEDIA_TYPE_LABELS } from "@/features/media/lib/media-labels"
import { m } from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

export const formatCount = (value: number) => value.toLocaleString(getLocale())

const plural = (count: number, one: () => string, many: (inputs: { count: string }) => string) =>
  count === 1 ? one() : many({ count: formatCount(count) })

export type RankedThumb =
  | {
      kind: "user"
      id: string
      displayUsername: string
      image: string | null
      avatarBorder: string | null
    }
  | { kind: "group"; id: string; name: string; logoUrl: string | null }
  | { kind: "title"; id: string; name: string; coverUrl: string | null }

type RankedLink =
  | { to: "/users/$username"; params: { username: string } }
  | { to: "/groups/$groupId"; params: { groupId: string } }
  | { to: "/media/$mediaId"; params: { mediaId: string } }

export type RankedEntry = {
  id: string
  rank: number
  value: number
  name: string
  nameEffect: string | null
  link: RankedLink
  thumb: RankedThumb
  chip: string
  tag:
    | { kind: "title"; title: string }
    | { kind: "status"; status: TitlesRanking["entries"][number]["media"]["status"] }
    | null
  sub: string
}

export type RankedStanding = {
  rank: number
  value: number
  name: string
  thumb: RankedThumb
  chip: string | null
  sub: string
}

/** The number a category ranks by, worded for `value`. */
export const formatMetric = (category: RankingCategory, value: number) =>
  category === "titles"
    ? plural(value, m.rankings_metric_reads_one, m.rankings_metric_reads)
    : plural(value, m.rankings_metric_chapters_one, m.rankings_metric_chapters)

export const toReaderEntries = (ranking: ReadersRanking) =>
  ranking.entries.map(
    ({ rank, value, pages, user }) =>
      ({
        id: user.id,
        rank,
        value,
        name: user.displayUsername,
        nameEffect: user.nameEffect,
        link: { to: "/users/$username", params: { username: user.username } },
        thumb: {
          kind: "user",
          id: user.id,
          displayUsername: user.displayUsername,
          image: user.image,
          avatarBorder: user.avatarBorder,
        },
        chip: m.rankings_level({ level: formatCount(user.level) }),
        tag: user.title === null ? null : { kind: "title", title: user.title },
        sub: plural(pages, m.rankings_pages_one, m.rankings_pages),
      }) satisfies RankedEntry,
  )

export const toGroupEntries = (ranking: GroupsRanking) =>
  ranking.entries.map(
    ({ rank, value, medias, group }) =>
      ({
        id: group.id,
        rank,
        value,
        name: group.name,
        nameEffect: null,
        link: { to: "/groups/$groupId", params: { groupId: group.id } },
        thumb: { kind: "group", id: group.id, name: group.name, logoUrl: group.logoUrl },
        chip: plural(medias, m.rankings_group_titles_one, m.rankings_group_titles),
        tag: null,
        sub: plural(group.memberCount, m.rankings_group_members_one, m.rankings_group_members),
      }) satisfies RankedEntry,
  )

export const toTitleEntries = (ranking: TitlesRanking) =>
  ranking.entries.map(
    ({ rank, value, readers, media }) =>
      ({
        id: media.id,
        rank,
        value,
        name: media.title ?? m.rankings_untitled(),
        nameEffect: null,
        link: { to: "/media/$mediaId", params: { mediaId: media.id } },
        thumb: {
          kind: "title",
          id: media.id,
          name: media.title ?? "",
          coverUrl: media.coverUrl,
        },
        chip: MEDIA_TYPE_LABELS[media.type](),
        tag: { kind: "status", status: media.status },
        sub: plural(readers, m.rankings_title_readers_one, m.rankings_title_readers),
      }) satisfies RankedEntry,
  )

export const toReaderStanding = (
  ranking: ReadersRanking,
  viewer: {
    id: string
    displayUsername: string
    image: string | null
    avatarBorder: string | null
  },
) => {
  const { me } = ranking

  if (me === null) {
    return null
  }

  const above = me.above?.user.displayUsername ?? ""

  return {
    rank: me.rank,
    value: me.value,
    name: viewer.displayUsername,
    thumb: { kind: "user", ...viewer },
    chip: m.rankings_level({ level: formatCount(me.level) }),
    sub:
      me.above === null
        ? m.rankings_me_first()
        : plural(
            me.above.gap,
            () => m.rankings_me_gap_one({ name: above }),
            ({ count }) => m.rankings_me_gap({ count, name: above }),
          ),
  } satisfies RankedStanding
}

export const toGroupStanding = (ranking: GroupsRanking) => {
  const { me } = ranking

  if (me === null) {
    return null
  }

  const above = me.above?.group.name ?? ""

  return {
    rank: me.rank,
    value: me.value,
    name: me.group.name,
    thumb: { kind: "group", id: me.group.id, name: me.group.name, logoUrl: me.group.logoUrl },
    chip: m.rankings_me_group(),
    sub:
      me.above === null
        ? m.rankings_me_group_first()
        : plural(
            me.above.gap,
            () => m.rankings_me_group_gap_one({ name: above }),
            ({ count }) => m.rankings_me_group_gap({ count, name: above }),
          ),
  } satisfies RankedStanding
}
