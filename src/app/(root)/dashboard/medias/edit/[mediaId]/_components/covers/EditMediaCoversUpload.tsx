import type { FormikConfig } from "formik";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { EditMediaCoversUploadForm } from "~/app/(root)/dashboard/medias/edit/[mediaId]/_components/covers/EditMediaCoversUploadForm";
import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { mediaCoversEditAtom } from "~/atoms/mediaEdit.atoms";
import { Form } from "~/components/generics/form/Form";
import { useUpload } from "~/hooks/useUpload";
import { uploadMediaCoverSchema } from "~/lib/schemas";
import type { UploadMediaCoverSchema } from "~/lib/schemas";
import { api } from "~/lib/trpc/client";
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils";

const initialValues: UploadMediaCoverSchema = [];

type Props = {
  mediaId: string;
};

export const EditMediaCoversUpload = ({ mediaId }: Props) => {
  const { mutateAsync: startUploadSession } =
    api.uploads.startUploadSession.useMutation();
  const { mutateAsync: createCovers } = api.mediaCovers.create.useMutation();
  const setSelectedImages = useSetAtom(selectedImagesAtom);
  const setMediaCoversEdit = useSetAtom(mediaCoversEditAtom);
  const { upload } = useUpload();

  const handleSubmit: FormikConfig<UploadMediaCoverSchema>["onSubmit"] = (
    values,
    { resetForm },
  ) => {
    const handleUpload = async () => {
      const usToken = await startUploadSession({
        type: "COVER",
        mediaId,
      });

      const coversId = await upload(usToken, "COVER");

      return await createCovers({
        mediaId,
        covers: values.map((x, i) => ({ ...x, id: coversId[i]! })),
      });
    };

    toast.promise(handleUpload(), {
      loading: "Upando a(s) cover(s)...",
      success: (newCovers) => {
        resetForm();
        setSelectedImages([]);
        setMediaCoversEdit((prev) =>
          MediaCoverUtils.computeVolumesAddition(prev, newCovers),
        );

        return "Cover(s) upada(s) com sucesso!";
      },
      error: "Ocorreu um erro ao upar a(s) cover(s).",
    });
  };

  return (
    <Form.Component
      validationSchema={toFormikValidationSchema(uploadMediaCoverSchema)}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      <EditMediaCoversUploadForm />
    </Form.Component>
  );
};
