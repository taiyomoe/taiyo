import type { FormikConfig } from "formik";
import { useAtomValue } from "jotai";
import { toFormikValidationSchema } from "zod-formik-adapter";

import { EditMediaCoversUploadForm } from "~/app/(root)/dashboard/medias/edit/[mediaId]/_components/covers/EditMediaCoversUploadForm";
import { selectedImagesAtom } from "~/atoms/imageCompression.atoms";
import { Form } from "~/components/generics/form/Form";
import { uploadMediaCoverSchema } from "~/lib/schemas";
import type { UploadMediaCoverSchema } from "~/lib/schemas";

const initialValues: UploadMediaCoverSchema = [];

export const EditMediaCoversUpload = () => {
  const selectedImages = useAtomValue(selectedImagesAtom).filter(
    (x) => x.type === "COVER",
  );

  const handleSubmit: FormikConfig<UploadMediaCoverSchema>["onSubmit"] = () => {
    console.log(selectedImages);

    console.log("submit");
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
