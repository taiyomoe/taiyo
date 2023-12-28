import { BulkUploadErrors } from "~/components/forms/chapters/bulk-upload/BulkUploadErrors"
import { UploadStatusLegend } from "~/components/forms/chapters/bulk-upload/UploadStatusLegend"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { MediasSearchAutocomplete } from "~/components/medias/MediasSearchAutocomplete"
import { FolderCard } from "~/components/ui/bulk-upload/FolderCard"
import { FolderDropzone } from "~/components/ui/bulk-upload/FolderDropzone"

export const BulkUploadChapterFormFields = () => {
  return (
    <Form.Layout>
      <Form.Category>
        <MediasSearchAutocomplete />
        <InputFormField name="concurrent" label="Limite" type="number" />
      </Form.Category>
      <FolderDropzone
        title="Capítulos"
        endContent={
          <>
            <UploadStatusLegend />
            <BulkUploadErrors />
          </>
        }
      >
        {({ selectedFolders }) => (
          <div className="flex flex-col gap-3">
            {selectedFolders
              .sort((a, b) => a[0] - b[0])
              .map((f, i) => (
                <FolderCard
                  key={f[0]}
                  folder={f}
                  position={`${i + 1}/${selectedFolders.length}`}
                />
              ))}
          </div>
        )}
      </FolderDropzone>
    </Form.Layout>
  )
}
