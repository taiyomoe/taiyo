import { useMutation } from "@tanstack/react-query";
import { type FormikConfig } from "formik";
import { useAtom } from "jotai";
import { toast } from "sonner";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { type InsertMediaChapterSchema } from "~/lib/schemas/mediaChapter.schemas";
import { api } from "~/lib/trpc/client";
import { type SuccessfulUploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/utils/MediaChapterUtils";

export const useChapterUpload = (initialValues: InsertMediaChapterSchema) => {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);

  const { mutateAsync: startUploadSession } =
    api.mediaChapters.startUploadSession.useMutation();
  const { mutateAsync: uploadImages } = useMutation<
    SuccessfulUploadResponse,
    unknown,
    { authToken: string }
  >({
    mutationKey: ["uploadImages", initialValues.id],
    mutationFn: async ({ authToken }) => {
      const formData = new FormData();

      selectedImages.forEach((img) => {
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

      console.log("data", data);

      return data;
    },
  });

  const handleSubmit: FormikConfig<InsertMediaChapterSchema>["onSubmit"] = (
    { mediaId },
    { resetForm, setSubmitting },
  ) => {
    const upload = async () => {
      const authToken = await startUploadSession({
        mediaId,
        mediaChapterId: initialValues.id,
      });

      const { pages } = await uploadImages({ authToken });

      pages.forEach((x) => {
        console.log(
          `https://cdn.taiyo.moe/${initialValues.mediaId}/${initialValues.id}/${x}.png`,
        );
      });

      resetForm();
      setSelectedImages([]);
    };

    toast.promise(upload, {
      loading: "Upando o capítulo...",
      success: "Capítulo upado!",
      error: "Ocorreu um erro ao upar o capítulo.",
      finally: () => {
        setSubmitting(false);
      },
    });
  };

  return { handleSubmit };
};
