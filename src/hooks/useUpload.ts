import type { UploadSessionType } from "@prisma/client";

import type { UploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { useImageStore } from "~/stores";

export const useUpload = () => {
  const { getImages } = useImageStore();

  const upload = async (authToken: string, type: UploadSessionType) => {
    const formData = new FormData();

    getImages(type).forEach((file) => {
      formData.append("file", file);
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
