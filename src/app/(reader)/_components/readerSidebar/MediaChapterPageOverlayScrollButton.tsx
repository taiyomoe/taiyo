import { useEffect } from "react";
import { Button } from "@nextui-org/react";
import { throttle } from "lodash-es";
import { ChevronsUp } from "lucide-react";

import { useReaderStore } from "~/stores";

export const MediaChapterPageOverlayScrollButton = () => {
  const { settings, updateSettings } = useReaderStore();

  const handlePress = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (settings.page.overlay === "hide") {
      return;
    }

    const onScroll = throttle(
      () => {
        const execute = async () => {
          // wait 500 ms
          await new Promise((resolve) => setTimeout(resolve, 200));

          console.log("hide overlay");

          updateSettings("page.overlay", "hide");
        };

        void execute();
      },
      1000,
      { trailing: false },
    );

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [settings.page.overlay, updateSettings]);

  return (
    <Button
      className="data-[disabled=true]:bg-default"
      startContent={<ChevronsUp />}
      onClick={handlePress}
      isDisabled={window.scrollY < 100}
      isIconOnly
    />
  );
};
