import type { UploadSessionType } from "@prisma/client";
import { useAtomValue } from "jotai";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import type { UploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

export const useUpload = () => {
  const selectedImages = useAtomValue(selectedImagesAtom);

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

    const data = (await response.json()) as UploadResponse;

    if ("error" in data) {
      throw new Error(data.error[0]);
    }

    return data.files;
  };

  return { upload };
};
