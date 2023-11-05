import { type UploadSessionType } from "@prisma/client";
import { useAtom } from "jotai";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { type SuccessfulUploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

export const useUpload = () => {
  const [selectedImages] = useAtom(selectedImagesAtom);

  const upload = async (authToken: string, type: UploadSessionType) => {
    const formData = new FormData();

    selectedImages
      .filter((x) => x.type === type)
      .forEach((img) => {
        formData.append("file", img.file);
      });

    const response = await fetch(MediaChapterUtils.getUploadEndpoint(), {
      method: "POST",
      headers: {
        Authorization: authToken,
      },
      body: formData,
    });

    const data = (await response.json()) as SuccessfulUploadResponse;

    return data.pages;
  };

  return { upload };
};
