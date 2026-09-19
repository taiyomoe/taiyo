import * as stylex from "@stylexjs/stylex"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { FileSearchIcon as FileSearchGlyph, PlusSignIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { fn } from "storybook/test"

const styles = stylex.create({
  grid: {
    gap: "1.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(1, minmax(0, 1fr))",
      "@media (width >= 48rem)": "repeat(2, minmax(0, 1fr))",
    },
  },
  box: {
    color: colors.mutedForeground,
    height: "2.5rem",
    width: "2.5rem",
  },
})
const meta = preview.meta({
  title: "UI/Empty",
  component: Empty,
  parameters: { layout: "fullscreen" },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={FileSearchGlyph} />
        </EmptyMedia>
        <EmptyTitle>No results found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your filters or search terms to find what you're looking for.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
})

export const Default = meta.story({})

export const WithAction = meta.story({
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={FileSearchGlyph} />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first project. You can always change things later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={fn()}>
          <HugeiconsIcon icon={PlusSignIcon} />
          New project
        </Button>
      </EmptyContent>
    </Empty>
  ),
})

export const MediaVariants = meta.story({
  render: () => (
    <div sx={styles.grid}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="default">
            <HugeiconsIcon icon={FileSearchGlyph} {...stylex.props(styles.box)} />
          </EmptyMedia>
          <EmptyTitle>Default media</EmptyTitle>
          <EmptyDescription>Bare icon, no decorative container.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={FileSearchGlyph} />
          </EmptyMedia>
          <EmptyTitle>Icon media</EmptyTitle>
          <EmptyDescription>Icon wrapped in a card with stacked back layers.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
})

export const TitleOnly = meta.story({
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Nothing here yet</EmptyTitle>
      </EmptyHeader>
    </Empty>
  ),
})
