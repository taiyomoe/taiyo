import type { Control } from "react-hook-form"
import * as stylex from "@stylexjs/stylex"
import { Globe, Lock } from "@taiyomoe/ui/components/icons"
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@taiyomoe/ui/components/ui/segmented-control"
import { breakpoints, colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useId } from "react"
import { Controller } from "react-hook-form"
import type { ListDetailsValues } from "@/features/lists/lib/list-editor"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  root: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    color: colors.foreground,
    fontSize: { default: "1rem", [breakpoints.sm]: "0.875rem" },
    fontWeight: 500,
    lineHeight: { default: "1.125rem", [breakpoints.sm]: "1rem" },
  },
  item: {
    gap: "0.375rem",
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
})

export function VisibilityField({ control }: { control: Control<ListDetailsValues> }) {
  const labelId = useId()
  const descriptionId = useId()

  return (
    <Controller
      control={control}
      name="visibility"
      render={({ field }) => (
        <div sx={styles.root}>
          <span id={labelId} sx={styles.label}>
            {m.list_editor_visibility()}
          </span>
          <SegmentedControl
            aria-describedby={descriptionId}
            aria-labelledby={labelId}
            fullWidth
            onValueChange={(next: unknown) => {
              if (next === "PUBLIC" || next === "PRIVATE") {
                field.onChange(next)
              }
            }}
            value={field.value}
          >
            <SegmentedControlItem sx={styles.item} value="PRIVATE">
              <Lock aria-hidden size={16} />
              {m.lists_private()}
            </SegmentedControlItem>
            <SegmentedControlItem sx={styles.item} value="PUBLIC">
              <Globe aria-hidden size={16} />
              {m.lists_public()}
            </SegmentedControlItem>
          </SegmentedControl>
          <p id={descriptionId} sx={styles.description}>
            {field.value === "PUBLIC"
              ? m.list_editor_visibility_public_hint()
              : m.list_editor_visibility_private_hint()}
          </p>
        </div>
      )}
    />
  )
}
