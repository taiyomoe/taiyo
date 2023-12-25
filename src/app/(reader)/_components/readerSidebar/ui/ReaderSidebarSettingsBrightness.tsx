"use client";

import { Slider } from "@nextui-org/slider";
import { tv } from "tailwind-variants";

import { useReaderSettingsStore } from "~/stores";

const readerSidebarSettingsBrightness = tv({
  slots: {
    container: "flex flex-col gap-2",
    text: "text-md",
    leftButton: "justify-start gap-3 pl-3",
    rightButton: "justify-end gap-3 pr-3",
  },
});

export const ReaderSidebarSettingsBrightness = () => {
  const { page, update } = useReaderSettingsStore();

  const { container, text } = readerSidebarSettingsBrightness();

  return (
    <div className={container()}>
      <p className={text()}>Brilho</p>
      <Slider
        className="max-w-md"
        onChange={(v) => update("page.brightness", Number(v), true)}
        defaultValue={page.brightness}
        maxValue={100}
        minValue={0}
        size="sm"
        aria-label="Brightness"
      />
    </div>
  );
};
