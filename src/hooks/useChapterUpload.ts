import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import type { FormikConfig } from "formik";
import { toast } from "sonner";

import type { InsertMediaChapterSchema } from "~/lib/schemas/mediaChapter.schemas";
import { api } from "~/lib/trpc/client";
import type { SuccessfulUploadResponse, UploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";
import { useImageStore } from "~/stores";

export const useChapterUpload = (initialValues: InsertMediaChapterSchema) => {
  const { getImages, reset } = useImageStore();
  const selectedImage = getImages("CHAPTER");

  const { mutateAsync: startUploadSession } =
    api.uploads.startUploadSession.useMutation();
  const { mutateAsync: uploadImages } = useMutation<
    SuccessfulUploadResponse,
    unknown,
    { authToken: string }
  >({
    mutationKey: ["uploadImages", initialValues.id],
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

  const handleSubmit: FormikConfig<InsertMediaChapterSchema>["onSubmit"] = (
    values,
    { resetForm, setSubmitting },
  ) => {
    const upload = async () => {
      const authToken = await startUploadSession({
        type: "CHAPTER",
        mediaId: values.mediaId,
        mediaChapterId: initialValues.id,
      });

      const { files: filesId } = await uploadImages({ authToken });

      await createChapter({ ...values, pages: filesId });

      resetForm();
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
