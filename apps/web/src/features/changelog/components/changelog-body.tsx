import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type { ChangelogBlock } from "@/features/changelog/lib/changelog"
import { changelogProse } from "@/features/changelog/components/changelog-prose"

const styles = stylex.create({
  heading: {
    margin: 0,
    color: colors.foreground,
    fontFamily: font.sans,
    fontSize: "1.1875rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.4,
    marginBottom: "-0.625rem",
    marginTop: "1.25rem",
  },
})

export const ChangelogBody = ({ blocks }: { blocks: readonly ChangelogBlock[] }) =>
  blocks.map((block) => {
    if (typeof block === "string") {
      return (
        <p key={block} sx={changelogProse.p}>
          {block}
        </p>
      )
    }

    if ("heading" in block) {
      return (
        <h3 key={block.heading} sx={styles.heading}>
          {block.heading}
        </h3>
      )
    }

    return (
      <ul key={block.join()} sx={changelogProse.ul}>
        {block.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  })
