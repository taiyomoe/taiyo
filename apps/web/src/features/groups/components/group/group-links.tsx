import * as stylex from "@stylexjs/stylex"
import { ExternalLink } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import type { Group } from "@/features/groups/api/groups"
import { m } from "@/paraglide/messages"

const LINKS = [
  ["website", m.group_link_website],
  ["discord", m.group_link_discord],
  ["x", m.group_link_x],
  ["facebook", m.group_link_facebook],
  ["instagram", m.group_link_instagram],
  ["telegram", m.group_link_telegram],
  ["youtube", m.group_link_youtube],
] as const
const styles = stylex.create({
  links: {
    gap: "0.5rem",
    display: "flex",
    flexWrap: "wrap",
  },
  linkIcon: {
    color: colors.mutedForeground,
  },
})

type GroupLinksProps = {
  group: Group
}

export function GroupLinks({ group }: GroupLinksProps) {
  const links = LINKS.flatMap(([key, label]) => {
    const value = group[key]

    if (value === null || value === "") {
      return []
    }

    const href =
      key === "discord" && !/^https?:\/\//.test(value)
        ? `https://discord.gg/${value.replace(/^\/?invite\//, "")}`
        : value

    return /^https?:\/\//.test(href) ? [{ key, label, href }] : []
  })

  if (links.length === 0) {
    return null
  }

  return (
    <div sx={styles.links}>
      {links.map((link) => (
        <Button
          key={link.key}
          render={<a href={link.href} rel="noopener noreferrer nofollow" target="_blank" />}
          size="sm"
          variant="outline"
        >
          {link.label()}
          <ExternalLink {...stylex.props(styles.linkIcon)} />
        </Button>
      ))}
    </div>
  )
}
