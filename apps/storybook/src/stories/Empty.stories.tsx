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
import { FileSearchIcon, PlusIcon } from "lucide-react"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/Empty",
  component: Empty,
  parameters: { layout: "fullscreen" },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileSearchIcon />
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
          <FileSearchIcon />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Get started by creating your first project. You can always change things later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={fn()}>
          <PlusIcon />
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
            <FileSearchIcon className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Default media</EmptyTitle>
          <EmptyDescription>Bare icon, no decorative container.</EmptyDescription>
        </EmptyHeader>
      </Empty>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileSearchIcon />
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
