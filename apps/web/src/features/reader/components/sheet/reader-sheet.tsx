import * as stylex from "@stylexjs/stylex"
import { Undo } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Separator } from "@taiyomoe/ui/components/ui/separator"
import {
  Sheet,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@taiyomoe/ui/components/ui/sheet"
import { type ComponentProps, useRef } from "react"
import type { ReaderSettingsControls } from "@/features/reader/hooks/use-reader-settings"
import { ChapterSection } from "@/features/reader/components/sheet/chapter-section"
import { ControlsSection } from "@/features/reader/components/sheet/controls-section"
import { ImageSection } from "@/features/reader/components/sheet/image-section"
import { LayoutSection } from "@/features/reader/components/sheet/layout-section"
import { ProgressSection } from "@/features/reader/components/sheet/progress-section"
import { ShortcutsSection } from "@/features/reader/components/sheet/shortcuts-section"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  popup: {
    outlineStyle: "none",
    maxWidth: "24rem",
  },
  header: {
    paddingBottom: 0,
  },
  panel: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
})

export function ReaderSheet({
  open,
  onOpenChange,
  controls,
  signedIn,
  chapter,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  controls: ReaderSettingsControls
  signedIn: boolean
  chapter: ComponentProps<typeof ChapterSection>
}) {
  const popup = useRef<HTMLDivElement | null>(null)

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetPopup
        initialFocus={popup}
        ref={popup}
        showBackdrop={false}
        side="left"
        sx={styles.popup}
      >
        <SheetHeader sx={styles.header}>
          <SheetTitle>{m.reader_sheet_title()}</SheetTitle>
          <SheetDescription>{m.reader_sheet_description()}</SheetDescription>
        </SheetHeader>
        <SheetPanel sx={styles.panel}>
          <ChapterSection {...chapter} />
          <Separator />
          <LayoutSection
            longStrip={controls.longStrip}
            settings={controls.settings}
            update={controls.update}
          />
          <Separator />
          <ImageSection {...controls} />
          <Separator />
          <ProgressSection settings={controls.settings} update={controls.update} />
          <Separator />
          <ControlsSection
            settings={controls.settings}
            signedIn={signedIn}
            update={controls.update}
          />
          <Separator />
          <ShortcutsSection />
        </SheetPanel>
        <SheetFooter>
          <Button
            onClick={() => {
              controls.reset()
            }}
            variant="outline"
          >
            <Undo />
            {m.reader_reset_all()}
          </Button>
        </SheetFooter>
      </SheetPopup>
    </Sheet>
  )
}
