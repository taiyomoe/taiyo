import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { collapsibleTriggerMarker } from "@taiyomoe/ui/styles/markers.stylex"
import preview from "@/storybook/preview"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@taiyomoe/ui/components/ui/collapsible"
import { fn } from "storybook/test"

const styles = stylex.create({
  /**
   * Turns over when the panel opens. Base UI puts `data-panel-open` on the
   * trigger, not on this icon, so the rotation reaches up to it through the
   * marker CollapsibleTrigger spreads on itself.
   */
  chevron: {
    rotate: {
      default: null,
      [stylex.when.ancestor("[data-panel-open]", collapsibleTriggerMarker)]: "180deg",
    },
    transitionDuration: "200ms",
    transitionProperty: "rotate",
  },
  /** The disclosed content, echoing the surface of the trigger above it. */
  panel: {
    padding: "0.75rem",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    backgroundColor: colors.popover,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
  anchor: {
    width: "18rem",
  },
  box: {
    justifyContent: "space-between",
    width: "100%",
  },
})
const meta = preview.meta({
  title: "UI/Collapsible",
  component: Collapsible,
  subcomponents: { CollapsibleTrigger, CollapsiblePanel },
  parameters: { layout: "centered" },
  argTypes: {
    disabled: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
  args: { onOpenChange: fn() },
})

export const Default = meta.story({
  render: (args) => (
    <Collapsible {...args} sx={styles.anchor}>
      <CollapsibleTrigger
        render={
          <Button sx={styles.box} variant="outline">
            <span>Recent activity</span>
            <HugeiconsIcon icon={ArrowDown01Icon} {...stylex.props(styles.chevron)} />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div sx={styles.panel}>
          <div>Created a new project.</div>
          <div>Invited 3 collaborators.</div>
          <div>Updated profile picture.</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
})

export const OpenByDefault = meta.story({
  args: { defaultOpen: true },
  render: (args) => (
    <Collapsible {...args} sx={styles.anchor}>
      <CollapsibleTrigger
        render={
          <Button sx={styles.box} variant="outline">
            <span>Recent activity</span>
            <HugeiconsIcon icon={ArrowDown01Icon} {...stylex.props(styles.chevron)} />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div sx={styles.panel}>
          <div>Created a new project.</div>
          <div>Invited 3 collaborators.</div>
          <div>Updated profile picture.</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
})

export const Disabled = meta.story({
  args: { disabled: true },
  render: (args) => (
    <Collapsible {...args} sx={styles.anchor}>
      <CollapsibleTrigger
        render={
          <Button sx={styles.box} variant="outline">
            <span>Recent activity</span>
            <HugeiconsIcon icon={ArrowDown01Icon} {...stylex.props(styles.chevron)} />
          </Button>
        }
      />
      <CollapsiblePanel>
        <div sx={styles.panel}>
          <div>Created a new project.</div>
          <div>Invited 3 collaborators.</div>
          <div>Updated profile picture.</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  ),
})
