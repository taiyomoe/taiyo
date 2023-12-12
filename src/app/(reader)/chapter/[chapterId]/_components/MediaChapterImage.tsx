import { tv } from "@nextui-org/react";

import { useReaderStore } from "~/stores";

type Props = {
  url: string;
  hide: boolean;
};

const mediaChapterImage = tv({
  slots: {
    image: "object-contain",
  },
  variants: {
    hide: {
      true: { image: "hidden" },
      false: { image: "block" },
    },
    pageMode: {
      single: { image: "h-full w-full" },
      longstrip: { image: "h-full w-auto" },
    },
  },
});

export const MediaChapterImage = ({ url, hide }: Props) => {
  const pageMode = useReaderStore(({ settings }) => settings.pageMode);

  const { image } = mediaChapterImage({ hide, pageMode });

  return <img src={url} className={image()} alt="image" />;
};
