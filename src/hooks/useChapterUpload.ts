import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import type { FormikConfig } from "formik";
import { toast } from "sonner";

import type { InsertMediaChapterFormSchema } from "~/lib/schemas/mediaChapter.schemas";
import { api } from "~/lib/trpc/client";
import type { SuccessfulUploadResponse, UploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { useImageStore } from "~/stores";

export const useChapterUpload = () => {
  const { getImages, reset } = useImageStore();
  const selectedImage = getImages("CHAPTER");

  const { mutateAsync: startUploadSession } =
    api.uploads.startUploadSession.useMutation();
  const { mutateAsync: uploadImages } = useMutation<
    SuccessfulUploadResponse,
    unknown,
    { authToken: string }
  >({
    mutationKey: ["uploadImages"],
    mutationFn: async ({ authToken }) => {
      const formData = new FormData();
      formData.append("type", "CHAPTER");

      selectedImage.forEach((file) => {
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

      return data;
    },
  });
  const { mutateAsync: createChapter } = api.mediaChapters.create.useMutation();

  const handleSubmit: FormikConfig<InsertMediaChapterFormSchema>["onSubmit"] = (
    values,
    { resetForm, setFieldValue, setSubmitting },
  ) => {
    const upload = async () => {
      const { mediaChapterId, authToken } = await startUploadSession({
        type: "CHAPTER",
        mediaId: values.mediaId,
      });

      const { files: filesId } = await uploadImages({ authToken });

      await createChapter({ ...values, id: mediaChapterId, pages: filesId });

      resetForm();

      void setFieldValue("mediaId", values.mediaId);
      void setFieldValue("number", values.number + 1);
      void setFieldValue("volume", values.volume);
      void setFieldValue("scanIds", values.scanIds);

      reset("CHAPTER");
    };

    toast.promise(upload, {
      loading: "Upando o capítulo...",
      success: "Capítulo upado!",
      error: (err) =>
        err instanceof TRPCClientError
          ? err.message
          : "Ocorreu um erro ao upar o capítulo",
      finally: () => {
        setSubmitting(false);
      },
    });
  };

  return { handleSubmit };
};
