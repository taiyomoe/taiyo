import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { colors, radius, shadows } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { DeleteListButton } from "@/features/lists/components/list-editor/delete-list-button"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  bar: {
    padding: "0.5rem",
    borderColor: colors.border,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "0.5rem",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    backgroundClip: "border-box",
    backgroundColor: `color-mix(in srgb, ${colors.popover} 88%, transparent)`,
    boxShadow: shadows.overlay,
    display: "flex",
    position: "sticky",
    zIndex: 2,
    bottom: "1rem",
  },
  end: {
    gap: "0.5rem",
    display: "flex",
    marginInlineStart: "auto",
  },
})

export function EditorBar({
  list,
  submitting,
}: {
  list: { id: string; name: string } | null
  submitting: boolean
}) {
  return (
    <div sx={styles.bar}>
      {list === null ? null : <DeleteListButton list={list} />}
      <div sx={styles.end}>
        <Button
          render={
            list === null ? (
              <Link to="/lists" />
            ) : (
              <Link params={{ listId: list.id }} to="/lists/$listId" />
            )
          }
          variant="outline"
        >
          {m.cancel()}
        </Button>
        <Button loading={submitting} type="submit">
          {list === null ? m.list_editor_create() : m.list_editor_save()}
        </Button>
      </div>
    </div>
  )
}
