import * as stylex from "@stylexjs/stylex"
import { Bookmark } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Popover,
  PopoverDescription,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@taiyomoe/ui/components/ui/popover"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { Link } from "@tanstack/react-router"
import { mediaSidebarStyles } from "@/features/media/components/media-sidebar/media-sidebar-styles"
import { ReadButton } from "@/features/media/components/media-sidebar/read-button"
import { useCurrentHref } from "@/hooks/use-current-href"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  prompt: {
    gap: "0.5rem",
    paddingInline: "1rem",
    display: "flex",
    flexDirection: "column",
    maxWidth: "min(18rem, calc(100vw - 2rem))",
  },
  promptTitle: {
    margin: 0,
    color: colors.foreground,
    fontSize: "0.9375rem",
    fontWeight: 600,
  },
  promptText: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    lineHeight: 1.5,
  },
  promptActions: {
    gap: "0.5rem",
    display: "flex",
    paddingTop: "0.375rem",
  },
})

export function SignedOutActions() {
  const href = useCurrentHref()

  return (
    <div sx={mediaSidebarStyles.actions}>
      <ReadButton progress={null} />
      <Popover>
        <PopoverTrigger render={<Button sx={mediaSidebarStyles.library} variant="outline" />}>
          <Bookmark />
          {m.media_library_add()}
        </PopoverTrigger>
        <PopoverPopup align="center" arrow side="bottom">
          <div sx={styles.prompt}>
            <PopoverTitle sx={styles.promptTitle}>{m.media_sign_in_title()}</PopoverTitle>
            <PopoverDescription sx={styles.promptText}>
              {m.media_sign_in_description()}
            </PopoverDescription>
            <div sx={styles.promptActions}>
              <Button render={<Link search={{ redirect: href }} to="/auth/sign-in" />} size="sm">
                {m.auth_sign_in()}
              </Button>
              <Button
                render={<Link search={{ redirect: href }} to="/auth/sign-up" />}
                size="sm"
                variant="outline"
              >
                {m.auth_sign_up()}
              </Button>
            </div>
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  )
}
