import { useMutation } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import type { FormikConfig } from "formik";
import { useAtom } from "jotai";
import { toast } from "sonner";

import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import type { InsertMediaChapterSchema } from "~/lib/schemas/mediaChapter.schemas";
import { api } from "~/lib/trpc/client";
import type { SuccessfulUploadResponse } from "~/lib/types";
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils";

export const useChapterUpload = (initialValues: InsertMediaChapterSchema) => {
  const [selectedImages, setSelectedImages] = useAtom(selectedImagesAtom);

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

      const { pages } = await uploadImages({ authToken });

      await createChapter({ ...values, pages });

      resetForm();
      setSelectedImages([]);
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
