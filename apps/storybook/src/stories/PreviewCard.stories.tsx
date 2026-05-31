import preview from "@/storybook/preview"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@taiyomoe/ui/components/ui/preview-card"
import { fn } from "storybook/test"

const meta = preview.meta({
  title: "UI/PreviewCard",
  component: PreviewCard,
  subcomponents: { PreviewCardTrigger, PreviewCardPopup },
  parameters: { layout: "centered" },
  args: {
    onOpenChange: fn(),
  },
})

export const Default = meta.story({
  render: (args) => (
    <PreviewCard {...args}>
      <PreviewCardTrigger
        className="font-medium underline-offset-4 hover:underline"
        href="https://github.com/taiyomoe"
        rel="noreferrer"
        target="_blank"
      >
        @taiyomoe
      </PreviewCardTrigger>
      <PreviewCardPopup align="center">
        <div className="flex flex-col gap-2">
          <div className="size-10 rounded-full bg-muted" />
          <div className="flex flex-col gap-0.5">
            <p className="leading-none font-semibold">Taiyo</p>
            <p className="text-xs text-muted-foreground">@taiyomoe</p>
          </div>
          <p className="text-sm">
            A community-built reading platform — manga, manhwa, and more, all in one place.
          </p>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  ),
})

export const Alignment = meta.story({
  render: () => (
    <div className="flex flex-wrap gap-12">
      {(["start", "center", "end"] as const).map((align) => (
        <PreviewCard defaultOpen key={align}>
          <PreviewCardTrigger className="font-medium underline-offset-4 hover:underline">
            {align}
          </PreviewCardTrigger>
          <PreviewCardPopup align={align}>
            <p className="text-sm">Aligned to {align}</p>
          </PreviewCardPopup>
        </PreviewCard>
      ))}
    </div>
  ),
})

export const InstantOpen = meta.story({
  render: (args) => (
    <PreviewCard {...args}>
      <PreviewCardTrigger
        className="font-medium underline-offset-4 hover:underline"
        closeDelay={0}
        delay={0}
        href="https://github.com/taiyomoe"
        rel="noreferrer"
        target="_blank"
      >
        @taiyomoe
      </PreviewCardTrigger>
      <PreviewCardPopup align="center">
        <div className="flex flex-col gap-2">
          <div className="size-10 rounded-full bg-muted" />
          <div className="flex flex-col gap-0.5">
            <p className="leading-none font-semibold">Taiyo</p>
            <p className="text-xs text-muted-foreground">@taiyomoe</p>
          </div>
          <p className="text-sm">
            A community-built reading platform — manga, manhwa, and more, all in one place.
          </p>
        </div>
      </PreviewCardPopup>
    </PreviewCard>
  ),
})
