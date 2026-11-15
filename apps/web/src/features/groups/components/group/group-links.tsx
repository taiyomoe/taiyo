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
import { colors, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { groupProfileStyles } from "@/features/groups/components/group/profile/group-profile-styles"
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
const ROW_BLEED = "0.75rem"
const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  link: {
    borderRadius: radius.lg,
    gap: "0.75rem",
    marginInline: `calc(-1 * ${ROW_BLEED})`,
    paddingBlock: "0.5rem",
    paddingInline: ROW_BLEED,
    textDecoration: "none",
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${colors.foreground} 5%, transparent)`,
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
    borderRadius: radius.lg,
    alignItems: "center",
    backgroundColor: `color-mix(in srgb, ${colors.primary} 12%, transparent)`,
    color: `color-mix(in srgb, ${colors.primary} 80%, ${colors.foreground})`,
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
    fontWeight: 500,
  },
  host: {
    overflow: "hidden",
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
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
    <section sx={groupProfileStyles.section}>
      <h2 sx={groupProfileStyles.sectionTitle}>{m.group_find_us()}</h2>
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
