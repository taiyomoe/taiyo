import { useCallback, useEffect, useState } from "react";
import { Spinner } from "@nextui-org/react";
import axios from "axios";

import { useChapterNavigation } from "~/hooks/useChapterNavigation";
import type { ReaderBlob } from "~/lib/types";

import { DisplayMediaChapterImage } from "./DisplayMediaChapterImage";

export const DisplayMediaChapterImages = () => {
  const { images, chapter, currentPage } = useChapterNavigation();
  const [imageBlobs, setImageBlobs] = useState<ReaderBlob[]>([]);

  useEffect(() => {
    if (images.length === 0 || imageBlobs.length === images.length) return;

    console.log("here");

    const getImageBlobs = async () => {
      const blobs = await Promise.all(
        images.map(async (img) => {
          const blob = await fetch(img.url).then((res) => res.blob());

          return { ...img, blob };
        }),
      );
      // const test1 = await fetch(
      //   "https://cdn.taiyo.moe/21bc3f0b-73ac-44b6-8955-ae5a0a50cf39/356711ba-45db-49b8-b4ac-cc03aa674bbd/46f9c377-e8ff-4efc-b0d2-faad8dcd663d.jpg",
      //   { method: "HEAD", mode: "no-cors" },
      // );

      // const test2 = await axios.get(
      //   "https://pub-5836e59af07c42f5a76a222d3bd93bb0.r2.dev/21bc3f0b-73ac-44b6-8955-ae5a0a50cf39/356711ba-45db-49b8-b4ac-cc03aa674bbd/46f9c377-e8ff-4efc-b0d2-faad8dcd663d.jpg",
      // );

      // console.log("test1", test1);
      // console.log("test2", test2);

      setImageBlobs(blobs);
    };

    void getImageBlobs();
  }, [imageBlobs.length, images]);

  const RenderImage = useCallback(
    ({ img }: { img: ReaderBlob }) => (
      <DisplayMediaChapterImage
        blob={img.blob}
        hide={currentPage !== img.number}
      />
    ),
    [currentPage],
  );

  return (
    <div className="mx-auto flex h-full items-center">
      {chapter?.pages.length === 0 && <Spinner size="lg" />}
      {/* {images.map((img) => (
        <RenderImage key={img.url} img={img} />
      ))} */}
      {imageBlobs.map((img) => (
        <RenderImage key={img.url} img={img} />
      ))}
    </div>
  );
};
