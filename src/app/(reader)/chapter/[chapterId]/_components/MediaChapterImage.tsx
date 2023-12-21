import { tv } from "@nextui-org/react";

import { useReaderStore } from "~/stores";

type Props = {
  url: string;
  hide: boolean;
};

const mediaChapterImage = tv({
  base: "my-auto select-none",
  variants: {
    hide: {
      true: "hidden",
      false: "block",
    },
    mode: {
      single: "mx-auto",
      longstrip: "h-full w-auto",
    },
    height: {
      fit: "max-h-full",
      full: "",
    },
    width: {
      fit: "max-w-full object-contain",
      full: "max-w-[unset]",
    },
  },
});

export const MediaChapterImage = ({ url, hide }: Props) => {
  const { mode, height, width } = useReaderStore(
    ({ settings }) => settings.page,
  );

  const base = mediaChapterImage({ hide, mode, height, width });

  return <img src={url} className={base} alt="image" />;
};
