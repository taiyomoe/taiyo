import Image from "next/image";
import { Skeleton } from "@nextui-org/skeleton";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";

export const DisplayMediaChapterImages = () => {
  const { currentPageUrl } = useChapterNavigation();

  if (!currentPageUrl) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div className="mx-auto flex h-full">
      <Image
        src={currentPageUrl}
        className="h-full w-full object-contain"
        style={{
          objectFit: "contain",
          width: "100%",
        }}
        sizes="1"
        width={0}
        height={0}
        alt="image"
        priority
      />
    </div>
  );
};
