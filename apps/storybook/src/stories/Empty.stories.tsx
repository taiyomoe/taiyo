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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="default">
            <HugeiconsIcon icon={FileSearchGlyph} className="size-10 text-muted-foreground" />
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
