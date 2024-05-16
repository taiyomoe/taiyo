"use client"

import { typeboxResolver } from "@hookform/resolvers/typebox"
import {
  type UploadChapterInput,
  UploadChapterState,
  type UploadChaptersInput,
  uploadChaptersSchema,
} from "@taiyomoe/image-orchestrator"
import { useSetAtom } from "jotai"
import { parallel, sleep } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { bulkUploadChaptersStateAtoms } from "~/atoms/bulkUploadChapters.atoms"
import { Form } from "~/components/generics/form/new-form"
import { handleErrors, ioApi } from "~/eden/client"
import { BulkUploadChaptersFormFields } from "./bulk-upload-chapters-form-fields"

export const BulkUploadChaptersForm = () => {
  const methods = useForm<UploadChaptersInput>({
    resolver: typeboxResolver(uploadChaptersSchema),
    mode: "onTouched",
    defaultValues: { chapters: [], concurrent: 10 },
  })
  const setChaptersState = useSetAtom(bulkUploadChaptersStateAtoms)

  const handleSubmit: SubmitHandler<UploadChaptersInput> = (values) =>
    parallel(values.concurrent, values.chapters, async (chapter) => {
      const index = values.chapters.findIndex(
        (c) => c.number === chapter.number,
      )
      const position = `${index + 1}/${values.chapters.length}`
      const data: UploadChapterInput = { ...chapter, mediaId: values.mediaId }
      const setState = (state: UploadChapterState) =>
        setChaptersState((prev) => ({
          ...prev,
          [index]: state,
        }))

      setState(UploadChapterState.UPLOADING)

      toast.promise(ioApi.chapters.upload(data), {
        loading: `Upando o capítulo ${position}...`,
        error: (err) => {
          setState(UploadChapterState.PENDING)

          return handleErrors(
            `Ocorreu um erro inesperado ao upar o capítulo ${position}`,
          )(err)
        },
        success: () => {
          setState(UploadChapterState.UPLOADED)

          return `Capítulo ${position} upado com sucesso!`
        },
      })

      console.log(`Uploading chapter ${chapter.number}`)
      await sleep(1000)
    })

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <BulkUploadChaptersFormFields />
    </Form.Component>
  )
}
