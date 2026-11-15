import * as stylex from "@stylexjs/stylex"
import { Undo } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { ColorPicker } from "@taiyomoe/ui/components/ui/color-picker"
import type { ReaderSettingsControls } from "@/features/reader/hooks/use-reader-settings"
import {
  SettingField,
  SettingSection,
  SettingSlider,
  SettingSwitch,
} from "@/features/reader/components/sheet/setting-controls"
import { IMAGE_SETTING_KEYS, READER_BACKGROUNDS } from "@/features/reader/lib/reader-settings"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  picker: {
    width: "100%",
  },
  reset: {
    alignSelf: "flex-start",
  },
})

export function ImageSection({ settings, update, reset }: ReaderSettingsControls) {
  return (
    <SettingSection title={m.reader_section_image()}>
      <SettingSlider
        format={(value) => m.reader_percent({ value })}
        label={m.reader_brightness()}
        max={150}
        min={20}
        onChange={(brightness) => {
          update({ brightness })
        }}
        value={settings.brightness}
      />
      <SettingSlider
        format={(value) => m.reader_percent({ value })}
        label={m.reader_contrast()}
        max={150}
        min={50}
        onChange={(contrast) => {
          update({ contrast })
        }}
        value={settings.contrast}
      />
      <SettingSlider
        format={(value) => m.reader_percent({ value })}
        label={m.reader_saturation()}
        max={200}
        min={0}
        onChange={(saturation) => {
          update({ saturation })
        }}
        value={settings.saturation}
      />
      <SettingSlider
        format={(value) => m.reader_percent({ value })}
        label={m.reader_warmth()}
        max={100}
        min={0}
        onChange={(warmth) => {
          update({ warmth })
        }}
        value={settings.warmth}
      />
      <SettingSwitch
        checked={settings.grayscale}
        label={m.reader_grayscale()}
        onChange={(grayscale) => {
          update({ grayscale })
        }}
      />
      <SettingSwitch
        checked={settings.invert}
        hint={m.reader_invert_hint()}
        label={m.reader_invert()}
        onChange={(invert) => {
          update({ invert })
        }}
      />
      <SettingField label={m.reader_background()}>
        <ColorPicker
          aria-label={m.reader_background()}
          onChange={(background) => {
            update({ background })
          }}
          presets={READER_BACKGROUNDS}
          sx={styles.picker}
          value={settings.background}
        />
      </SettingField>
      <Button
        onClick={() => {
          reset(IMAGE_SETTING_KEYS)
        }}
        size="sm"
        sx={styles.reset}
        variant="ghost"
      >
        <Undo />
        {m.reader_reset_image()}
      </Button>
    </SettingSection>
  )
}
