import * as stylex from "@stylexjs/stylex"
import { colors, font } from "@taiyomoe/ui/styles/tokens.stylex"
import type {
  TagKey,
  TagSection as TagSectionData,
  TagState,
} from "@/features/advanced-search/lib/search-tags"
import { TagToggle } from "@/features/advanced-search/components/tags/tag-toggle"
import { TAG_SECTION_LABELS } from "@/features/advanced-search/lib/filter-options"

const styles = stylex.create({
  section: {
    gap: "0.75rem",
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    gap: "0.75rem",
    alignItems: "center",
    color: colors.foreground,
    display: "flex",
    fontSize: "1rem",
    fontWeight: font.weightBold,
    "::after": {
      backgroundColor: colors.border,
      content: '""',
      flexGrow: 1,
      height: 1,
    },
  },
  group: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  groupLabel: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  tags: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "flex",
    flexWrap: "wrap",
  },
})

export function TagSection({
  section,
  stateOf,
  onToggle,
}: {
  section: TagSectionData
  stateOf: (key: TagKey) => TagState | undefined
  onToggle: (key: TagKey) => void
}) {
  const grouped = section.groups.some((group) => group.label !== null)
  const label = TAG_SECTION_LABELS[section.id]()

  return (
    <section aria-label={label} sx={styles.section}>
      <h3 sx={styles.heading}>{label}</h3>
      {section.groups.map((group) => (
        <div key={group.label ?? ""} sx={styles.group}>
          {grouped && group.label !== null ? <p sx={styles.groupLabel}>{group.label}</p> : null}
          <ul sx={styles.tags}>
            {group.tags.map((tag) => (
              <li key={tag.key}>
                <TagToggle
                  onToggle={() => {
                    onToggle(tag.key)
                  }}
                  state={stateOf(tag.key)}
                  tag={tag}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
