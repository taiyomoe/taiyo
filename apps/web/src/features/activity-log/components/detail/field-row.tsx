import * as stylex from "@stylexjs/stylex"
import { FilterIn, FilterOut } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, containers, font, motion } from "@taiyomoe/ui/styles/tokens.stylex"
import { CopyButton } from "@/features/activity-log/components/detail/copy-button"
import { detailStyles } from "@/features/activity-log/components/detail/detail-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  row: {
    gridTemplateAreas: {
      default: '"field actions" "value value"',
      [containers.xl]: '"field value actions"',
    },
    alignItems: "center",
    columnGap: "0.75rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr) auto",
      [containers.xl]: "10rem minmax(0, 1fr) auto",
    },
    borderBottomColor: colors.border,
    borderBottomStyle: "solid",
    borderBottomWidth: 1,
    minHeight: "2.375rem",
  },
  value: {
    margin: 0,
    paddingBlock: "0.375rem",
    fontFamily: font.mono,
    fontSize: "0.8125rem",
    gridColumnEnd: "value",
    gridColumnStart: "value",
    gridRowEnd: "value",
    gridRowStart: "value",
    overflowWrap: "anywhere",
    maxHeight: "8rem",
    overflowY: "auto",
  },
  actions: {
    gap: "0.125rem",
    display: "flex",
    gridColumnEnd: "actions",
    gridColumnStart: "actions",
    gridRowEnd: "actions",
    gridRowStart: "actions",
    opacity: {
      default: 0,
      [stylex.when.ancestor(":focus-within")]: 1,
      [stylex.when.ancestor(":hover")]: 1,
    },
    transitionDuration: motion.enter,
    transitionProperty: "opacity",
  },
})

export function FieldRow({
  field,
  value,
  filterable,
  onFilter,
}: {
  field: string
  value: string
  filterable: boolean
  onFilter: (field: string, value: string, negate: boolean) => void
}) {
  return (
    <div sx={[styles.row, stylex.defaultMarker()]}>
      <dt sx={detailStyles.field}>{field}</dt>
      <dd sx={styles.value}>{value}</dd>
      <div sx={styles.actions}>
        {filterable ? (
          <>
            <Button
              aria-label={m.activity_filter_for({ value })}
              onClick={() => {
                onFilter(field, value, false)
              }}
              size="icon-xs"
              sx={detailStyles.action}
              variant="ghost"
            >
              <FilterIn />
            </Button>
            <Button
              aria-label={m.activity_filter_out({ value })}
              onClick={() => {
                onFilter(field, value, true)
              }}
              size="icon-xs"
              sx={detailStyles.action}
              variant="ghost"
            >
              <FilterOut />
            </Button>
          </>
        ) : null}
        <CopyButton label={m.activity_copy_value({ field })} value={value} />
      </div>
    </div>
  )
}
