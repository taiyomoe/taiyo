import type { Sx } from "@taiyomoe/ui/styles/sx"
import * as stylex from "@stylexjs/stylex"
import { Users } from "@taiyomoe/ui/components/icons"
import { Popover, PopoverPopup, PopoverTrigger } from "@taiyomoe/ui/components/ui/popover"
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import type { LatestChapter } from "@/features/chapters/api/chapters"
import { useHoverPopover } from "@/hooks/use-hover-popover"
import { m } from "@/paraglide/messages"

const MORE_GROUPS_ACTIVE_BACKGROUND = `color-mix(in srgb, ${colors.foreground} 14%, transparent)`
const styles = stylex.create({
  groups: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    fontSize: "0.8125rem",
    minWidth: 0,
  },
  groupsIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  groupsTop: {
    alignItems: "flex-start",
  },
  groupNames: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    minWidth: 0,
  },
  groupsWrap: {
    flexWrap: "wrap",
    rowGap: "0.25rem",
  },
  group: {
    overflow: "hidden",
    textDecoration: "none",
    color: {
      default: `color-mix(in srgb, ${colors.foreground} 82%, transparent)`,
      ":hover": `color-mix(in srgb, ${colors.foreground} 62%, transparent)`,
    },
    fontWeight: 500,
    textOverflow: "ellipsis",
    transitionDuration: motion.enter,
    transitionProperty: "color",
    whiteSpace: "nowrap",
    maxWidth: "100%",
    minWidth: 0,
  },
  noGroup: {
    color: colors.mutedForeground,
    fontStyle: "italic",
    paddingRight: "0.125em",
  },
  moreGroups: {
    margin: 0,
    borderRadius: radius.full,
    borderWidth: 0,
    paddingBlock: 0,
    paddingInline: "0.375rem",
    backgroundColor: {
      "[data-popup-open]": MORE_GROUPS_ACTIVE_BACKGROUND,
      default: `color-mix(in srgb, ${colors.foreground} 8%, transparent)`,
      ":hover": MORE_GROUPS_ACTIVE_BACKGROUND,
    },
    color: {
      "[data-popup-open]": colors.foreground,
      default: colors.mutedForeground,
      ":hover": colors.foreground,
    },
    cursor: "default",
    flexShrink: 0,
    fontFamily: "inherit",
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: "1.125rem",
    outlineColor: colors.ring,
    outlineOffset: 2,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: "150ms",
    transitionProperty: "background-color, color",
    transitionTimingFunction: motion.easeOut,
  },
  moreGroupsList: {
    margin: 0,
    gap: "0.5rem",
    listStyle: "none",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxHeight: "min(16rem, 50vh)",
    maxWidth: "min(18rem, calc(100vw - 2rem))",
    overflowY: "auto",
  },
  moreGroupsItem: {
    gap: "0.5rem",
    alignItems: "flex-start",
    color: colors.foreground,
    display: "flex",
    fontSize: "0.8125rem",
    fontWeight: 500,
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },
  moreGroupsIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
    marginTop: "0.0625rem",
  },
})

export function ChapterGroups({
  groups,
  max = 1,
  wrap = false,
  sx,
}: {
  groups: LatestChapter["groups"]
  max?: number
  wrap?: boolean
  sx?: Sx
}) {
  const hidden = groups.slice(max)

  return (
    <span sx={[styles.groups, wrap && styles.groupsTop, sx]}>
      <Users aria-label={m.chapter_groups()} size={16} {...stylex.props(styles.groupsIcon)} />
      <span sx={[styles.groupNames, wrap && styles.groupsWrap]}>
        {groups.length === 0 ? (
          <span sx={[styles.group, styles.noGroup]}>{m.chapter_no_group()}</span>
        ) : (
          groups.slice(0, max).map((group) => (
            <Link
              key={group.id}
              params={{ groupId: group.id }}
              title={group.name}
              to="/groups/$groupId"
              {...stylex.props(styles.group)}
            >
              {group.name}
            </Link>
          ))
        )}
        {hidden.length > 0 ? <MoreGroups groups={hidden} /> : null}
      </span>
    </span>
  )
}

function MoreGroups({ groups }: { groups: LatestChapter["groups"] }) {
  const hover = useHoverPopover()

  return (
    <Popover onOpenChange={hover.onOpenChange} open={hover.open}>
      <PopoverTrigger
        {...hover.triggerProps}
        aria-label={m.chapter_more_groups_label({ count: groups.length })}
        sx={styles.moreGroups}
      >
        {m.chapter_more_groups({ count: groups.length })}
      </PopoverTrigger>
      <PopoverPopup {...hover.popupProps} arrow side="top">
        <ul sx={styles.moreGroupsList}>
          {groups.map((group) => (
            <li key={group.id} sx={styles.moreGroupsItem}>
              <Users size={14} {...stylex.props(styles.moreGroupsIcon)} />
              <Link
                params={{ groupId: group.id }}
                to="/groups/$groupId"
                {...stylex.props(styles.group)}
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      </PopoverPopup>
    </Popover>
  )
}
