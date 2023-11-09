import { tv } from "@nextui-org/react";
import { useAtomValue } from "jotai";

import { readerPageModeAtom } from "~/atoms/readerSettings.atoms";

type Props = {
  url: string;
  hide: boolean;
};

const displayMediaChapterImage = tv({
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

export const DisplayMediaChapterImage = ({ url, hide }: Props) => {
  const pageMode = useAtomValue(readerPageModeAtom);

  const { image } = displayMediaChapterImage({ hide, pageMode });

  return <img src={url} className={image()} alt="image" />;
};
