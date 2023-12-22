"use client";

import type { SliderValue } from "@nextui-org/slider";
import { Slider } from "@nextui-org/slider";
import { tv } from "tailwind-variants";

import { useReaderStore } from "~/stores";

const readerSidebarSettingsBrightness = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsBrightness = () => {
  const { settings, updateSettings } = useReaderStore();

  const { container, text } = readerSidebarSettingsBrightness();

  const handleChange = (value: SliderValue) => {
    updateSettings("page.brightness", Number(value));
  };

  return (
    <div className={container()}>
      <p className={text()}>Brilho</p>
      <Slider
        className="max-w-md"
        onChange={handleChange}
        defaultValue={settings.page.brightness}
        maxValue={100}
        minValue={0}
        size="sm"
        aria-label="Brightness"
      />
    </div>
  );
};
