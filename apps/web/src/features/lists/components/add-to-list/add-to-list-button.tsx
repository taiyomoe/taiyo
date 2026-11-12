import * as stylex from "@stylexjs/stylex"
import { List, Lock, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@taiyomoe/ui/components/ui/menu"
import { Spinner } from "@taiyomoe/ui/components/ui/spinner"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { myListsQueryOptions, useToggleListItem } from "@/features/lists/api/lists"
import { CreateListDialog } from "@/features/lists/components/add-to-list/create-list-dialog"
import { getErrorMessage } from "@/lib/errors"
import { useSettings } from "@/lib/settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  trigger: {
    justifyContent: "center",
    width: "100%",
  },
  menu: {
    maxHeight: "min(24rem, var(--available-height))",
    minWidth: "15rem",
  },
  name: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "14rem",
  },
  item: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
  },
  lock: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  loading: {
    paddingBlock: "0.75rem",
    color: colors.mutedForeground,
    display: "flex",
    justifyContent: "center",
  },
})

export function AddToListButton({ mediaId, mediaTitle }: { mediaId: string; mediaTitle: string }) {
  const { contentRatings } = useSettings()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const lists = useQuery({ ...myListsQueryOptions(contentRatings, mediaId), enabled: open })
  const toggle = useToggleListItem()

  return (
    <>
      <Menu onOpenChange={setOpen} open={open}>
        <MenuTrigger render={<Button sx={styles.trigger} variant="ghost" />}>
          <List />
          {m.media_add_to_list()}
        </MenuTrigger>
        <MenuPopup align="center" sx={styles.menu}>
          <MenuGroup>
            <MenuGroupLabel>{m.media_lists_label()}</MenuGroupLabel>
            {lists.data === undefined ? (
              <div sx={styles.loading}>
                <Spinner />
              </div>
            ) : (
              lists.data.data.map((list) => (
                <MenuCheckboxItem
                  checked={list.hasMedia === true}
                  closeOnClick={false}
                  key={list.id}
                  onCheckedChange={(checked) => {
                    toggle.mutate(
                      { listId: list.id, mediaId, add: checked },
                      {
                        onSuccess: () => {
                          toastManager.add({
                            title: checked
                              ? m.media_lists_added({ name: list.name })
                              : m.media_lists_removed({ name: list.name }),
                            type: "success",
                          })
                        },
                        onError: (error) => {
                          toastManager.add({ title: getErrorMessage(error), type: "error" })
                        },
                      },
                    )
                  }}
                >
                  <span sx={styles.item}>
                    <span sx={styles.name}>{list.name}</span>
                    {list.visibility === "PRIVATE" ? (
                      <Lock
                        aria-label={m.lists_private()}
                        size={14}
                        {...stylex.props(styles.lock)}
                      />
                    ) : null}
                  </span>
                </MenuCheckboxItem>
              ))
            )}
          </MenuGroup>
          {lists.data === undefined || lists.data.data.length === 0 ? null : <MenuSeparator />}
          <MenuItem
            onClick={() => {
              setCreating(true)
            }}
          >
            <Plus />
            {m.media_lists_new()}
          </MenuItem>
        </MenuPopup>
      </Menu>
      <CreateListDialog
        mediaId={mediaId}
        mediaTitle={mediaTitle}
        onOpenChange={setCreating}
        open={creating}
      />
    </>
  )
}
