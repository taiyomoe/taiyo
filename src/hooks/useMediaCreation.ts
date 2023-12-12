import { TRPCClientError } from "@trpc/client";
import type { FormikConfig } from "formik";
import { toast } from "sonner";

import type { InsertMediaSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";

export const useMediaCreation = () => {
  // const setSelectedImages = useSetAtom(selectedImagesAtom);
  // const { upload } = useUpload();

  // const { mutateAsync: startUploadSession } =
  //   api.uploads.startUploadSession.useMutation();
  const { mutateAsync: createMedia } = api.medias.create.useMutation();

  const handleSubmit: FormikConfig<InsertMediaSchema>["onSubmit"] = (
    values,
    { resetForm, setSubmitting },
  ) => {
    const uploadImages = async () => {
      /**
       * Upload the cover
       */
      // const coverAuthToken = await startUploadSession({
      //   type: "COVER",
      //   mediaId: values.id,
      // });
      // const [coverId] = await upload(coverAuthToken, "COVER");

      // if (!coverId) {
      //   throw new Error("Ocorreu um erro ao upar a cover.");
      // }

      /**
       * Upload the banner
       * No need to check if it exists, since it's optional
       */
      // const bannerAuthToken = await startUploadSession({
      //   type: "BANNER",
      //   mediaId: values.id,
      // });
      // const [bannerId] = await upload(bannerAuthToken, "BANNER");

      await createMedia(values);

      resetForm();
      // setSelectedImages([]);

      // TODO: Redirect to the media page
    };

    toast.promise(uploadImages, {
      loading: "Criando a obra...",
      success: "Obra criada!",
      error: (err) =>
        err instanceof TRPCClientError
          ? err.message
          : "Ocorreu um erro ao criar a obra",
      finally: () => {
        setSubmitting(false);
      },
    });
  };

  return { handleSubmit };
};
