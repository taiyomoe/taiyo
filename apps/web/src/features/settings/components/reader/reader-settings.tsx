import * as stylex from "@stylexjs/stylex"
import { Undo } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { ControlsSection } from "@/features/reader/components/sheet/controls-section"
import { ImageSection } from "@/features/reader/components/sheet/image-section"
import { LayoutSection } from "@/features/reader/components/sheet/layout-section"
import { ProgressSection } from "@/features/reader/components/sheet/progress-section"
import { ShortcutsSection } from "@/features/reader/components/sheet/shortcuts-section"
import {
  useReaderSettings,
  useReaderSettingsSync,
} from "@/features/reader/hooks/use-reader-settings"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { settingsStyles } from "@/features/settings/components/settings-styles"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  grid: {
    columnGap: "2.5rem",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "repeat(2, minmax(0, 1fr))",
    },
    rowGap: "2rem",
  },
  column: {
    gap: "2rem",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
})

export function ReaderSettings() {
  useReaderSettingsSync(true)

  const controls = useReaderSettings(false, true)

  return (
    <SettingsSection
      description={m.user_settings_reader_description()}
      footer={
        <div sx={settingsStyles.actions}>
          <Button
            onClick={() => {
              controls.reset()
            }}
            variant="outline"
          >
            <Undo />
            {m.reader_reset_all()}
          </Button>
        </div>
      }
      title={m.user_settings_reader_title()}
    >
      <div sx={styles.grid}>
        <div sx={styles.column}>
          <LayoutSection longStrip={false} settings={controls.settings} update={controls.update} />
          <ProgressSection settings={controls.settings} update={controls.update} />
          <ShortcutsSection />
        </div>
        <div sx={styles.column}>
          <ImageSection {...controls} />
          <ControlsSection settings={controls.settings} signedIn update={controls.update} />
        </div>
      </div>
    </SettingsSection>
  )
}
