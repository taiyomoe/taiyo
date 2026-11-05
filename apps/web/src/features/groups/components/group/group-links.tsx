import type { IconProps } from "@taiyomoe/ui/components/icons"
import type { ReactElement } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  At,
  Comment,
  ExternalLink,
  Globe,
  Image,
  Mail,
  Send,
  Users,
} from "@taiyomoe/ui/components/icons"
import { colors, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { groupStyles } from "@/features/groups/components/group/group-styles"
import { m } from "@/paraglide/messages"

const LINKS = [
  ["website", m.group_link_website, Globe],
  ["discord", m.group_link_discord, Comment],
  ["x", m.group_link_x, At],
  ["facebook", m.group_link_facebook, Users],
  ["instagram", m.group_link_instagram, Image],
  ["telegram", m.group_link_telegram, Send],
  ["youtube", m.group_link_youtube, ExternalLink],
] as const satisfies ReadonlyArray<
  readonly [keyof Group, () => string, (props: IconProps) => ReactElement]
>
const styles = stylex.create({
  card: {
    padding: "1.25rem",
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "0.25rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  link: {
    padding: "0.5rem",
    borderRadius: radius.lg,
    gap: "0.75rem",
    marginInline: "-0.5rem",
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 4%, transparent)`,
    },
    color: colors.foreground,
    display: "flex",
    outlineColor: colors.ring,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: 2,
    transitionDuration: motion.enter,
    transitionProperty: "background-color",
  },
  icon: {
    borderRadius: radius.full,
    alignItems: "center",
    backgroundColor: colors.well,
    color: colors.mutedForeground,
    display: "flex",
    flexShrink: 0,
    justifyContent: "center",
    height: "2.25rem",
    width: "2.25rem",
  },
  text: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  label: {
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  host: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontFamily: font.mono,
    fontSize: "0.75rem",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  external: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
})
const toHref = (key: string, value: string) =>
  key === "discord" && !/^https?:\/\//.test(value)
    ? `https://discord.gg/${value.replace(/^\/?invite\//, "")}`
    : value
const toDisplay = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
const getGroupLinks = (group: Group) => [
  ...LINKS.flatMap(([key, label, icon]) => {
    const value = group[key]

    if (value === null || value === "") {
      return []
    }

    const href = toHref(key, value)

    return /^https?:\/\//.test(href) ? [{ key, label, icon, href, display: toDisplay(href) }] : []
  }),
  ...(group.email === null || group.email === ""
    ? []
    : [
        {
          key: "email",
          label: m.group_link_email,
          icon: Mail,
          href: `mailto:${group.email}`,
          display: group.email,
        },
      ]),
]

export function GroupLinks({ group }: { group: Group }) {
  const links = getGroupLinks(group)

  if (links.length === 0) {
    return null
  }

  return (
    <section aria-label={m.group_find_us()} sx={[groupStyles.card, styles.card]}>
      <span sx={groupStyles.label}>{m.group_find_us()}</span>
      <ul sx={styles.list}>
        {links.map(({ key, label, icon: Icon, href, display }) => (
          <li key={key}>
            <a
              href={href}
              rel="noopener noreferrer nofollow"
              target="_blank"
              {...stylex.props(styles.link)}
            >
              <span sx={styles.icon}>
                <Icon size={16} />
              </span>
              <span sx={styles.text}>
                <span sx={styles.label}>{label()}</span>
                <span sx={styles.host}>{display}</span>
              </span>
              <ExternalLink size={14} {...stylex.props(styles.external)} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
