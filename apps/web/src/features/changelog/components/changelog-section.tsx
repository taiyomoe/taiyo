import * as stylex from "@stylexjs/stylex"
import { ChevronRight } from "@taiyomoe/ui/components/icons"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@taiyomoe/ui/components/ui/collapsible"
import { colors, consts, font, motion, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useState } from "react"
import type { ChangelogSection as Section } from "@/features/changelog/lib/changelog"
import { changelogProse } from "@/features/changelog/components/changelog-prose"
import { ChangelogTag } from "@/features/changelog/components/changelog-tag"
import { getLocale } from "@/paraglide/runtime"

const styles = stylex.create({
  section: {
    borderTopColor: colors.border,
    borderTopStyle: "solid",
    borderTopWidth: { default: "1px", ":first-child": 0 },
  },
  trigger: {
    borderRadius: radius.lg,
    borderWidth: 0,
    marginBlock: "0.25rem",
    marginInline: "-0.75rem",
    paddingBlock: "0.75rem",
    paddingInline: "0.75rem",
    alignItems: "center",
    backgroundColor: "transparent",
    color: colors.foreground,
    cursor: "pointer",
    display: "flex",
    fontFamily: font.sans,
    fontSize: "0.9375rem",
    fontWeight: 500,
    justifyContent: "space-between",
    lineHeight: "1.5rem",
    outlineColor: colors.ring,
    outlineOffset: 0,
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: "2px",
    textAlign: "start",
    width: "calc(100% + 1.5rem)",
  },
  chevron: {
    color: colors.mutedForeground,
    flexShrink: 0,
    transitionDuration: motion.exit,
    transitionProperty: "transform",
    transitionTimingFunction: motion.easeOut,
  },
  chevronOpen: {
    transform: "rotate(90deg)",
  },
  panel: {
    opacity: { "[data-ending-style]": 0, "[data-starting-style]": 0, default: 1 },
    transitionDelay: { "[data-ending-style]": "0ms", default: "0ms, 70ms" },
    transitionDuration: {
      "[data-ending-style]": "300ms, 200ms",
      default: "350ms, 250ms",
      [consts.reducedMotion]: "0ms",
    },
    transitionProperty: "height, opacity",
    transitionTimingFunction: motion.easeOut,
  },
  list: {
    paddingBottom: "1rem",
  },
})

export const ChangelogSection = ({ section }: { section: Section }) => {
  const [open, setOpen] = useState(false)
  const locale = getLocale()

  return (
    <Collapsible onOpenChange={setOpen} open={open} sx={styles.section}>
      <CollapsibleTrigger sx={styles.trigger}>
        {section.title[locale]}
        <ChevronRight
          {...stylex.props(styles.chevron, open && styles.chevronOpen)}
          aria-hidden
          size={16}
        />
      </CollapsibleTrigger>
      <CollapsiblePanel hiddenUntilFound sx={styles.panel}>
        <ul sx={[changelogProse.text, changelogProse.ul, styles.list]}>
          {section.items.map((item) => (
            <li key={item.text.en}>
              <ChangelogTag tag={item.tag} /> {item.text[locale]}
            </li>
          ))}
        </ul>
      </CollapsiblePanel>
    </Collapsible>
  )
}
