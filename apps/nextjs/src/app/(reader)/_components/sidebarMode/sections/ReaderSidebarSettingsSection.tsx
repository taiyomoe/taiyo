import { tv } from "tailwind-variants";

import { ReaderSidebarSettingsSide } from "../ui/ReaderSidebarSettingsSide";

const readerSidebarSettingsSection = tv({
  slots: {
    container: "flex flex-col gap-2",
  },
});

export const ReaderSidebarSettingsSection = () => {
  const { container } = readerSidebarSettingsSection();
  return (
    <div className={container()}>
      <ReaderSidebarSettingsSide />
    </div>
  );
};
