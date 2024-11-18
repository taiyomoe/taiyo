"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  type UploadChapterInput,
  type UploadChaptersInput,
  uploadChaptersSchema,
} from "@taiyomoe/schemas"
import { UploadChapterState } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { parallel, tryit } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { bulkUploadChaptersStateAtoms } from "~/atoms/bulkUploadChapters.atoms"
import { Form } from "~/components/generics/form/form"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { S3Service } from "~/services/s3.web-service"
import { api } from "~/trpc/react"
import { BulkUploadChaptersFormFields } from "./bulk-upload-chapters-form-fields"

export const BulkUploadChaptersForm = () => {
  const { mutateAsync: requestPresignedUrls } =
    api.chapters.upload.useMutation()
  const { mutateAsync: commitUpload } = api.chapters.commit.useMutation()
  const { handleErrorRaw } = useErrorHandler()
  const setChaptersState = useSetAtom(bulkUploadChaptersStateAtoms)
  const methods = useForm<UploadChaptersInput>({
    resolver: zodResolver(uploadChaptersSchema),
    mode: "onTouched",
    defaultValues: {
      chapters: [],
      concurrent: 10,
      mediaId: "",
    },
  })

  const handleSubmit: SubmitHandler<UploadChaptersInput> = async (values) => {
    await parallel(values.concurrent, values.chapters, async (chapter) => {
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

      /**
       * 1. Ask for presigned urls
       */
      const toastId = toast.loading(
        `Gerando os links de upload do capítulo ${position}...`,
      )
      const [getUrlsError, getUrlsResult] = await tryit(requestPresignedUrls)({
        ...data,
        files: data.files.map(({ file: _, ...f }) => f),
      })

      if (getUrlsError) {
        return handleErrorRaw(
          getUrlsError,
          `Ocorreu um erro inesperado ao gerar os links de upload do capítulo ${position}`,
          toastId,
        )
      }

      const { id, urls } = getUrlsResult
      const files = data.files.map((f, i) => ({
        ...f,
        file: f.file!,
        url: urls[i]!,
      }))

      /**
       * 2. Upload files to S3 Bucket
       */
      toast.loading(`Upando as imagens do capítulo ${position} na Cloudflare`, {
        id: toastId,
      })

      const uploadedFiles = await S3Service.upload(files, (name) => {
        setState(UploadChapterState.ERROR)

        toast.error(
          `Ocorreu um erro inesperado ao upar o ficheiro '${name}' do capítulo ${position}. Cancelando o upload...`,
          { id: toastId },
        )
      })

      if (uploadedFiles.includes(null)) {
        return
      }

      /**
       * 3. Commit upload
       */
      toast.loading(`Servidor processando o capítulo ${position}...`, {
        id: toastId,
      })

      const [commitError] = await tryit(commitUpload)(id)

      if (commitError) {
        setState(UploadChapterState.ERROR)

        return handleErrorRaw(
          commitError,
          `Ocorreu um erro inesperado ao indicar ao servidor que o capítulo ${position} foi upado`,
          toastId,
        )
      }

      /**
       * 4. Reset form
       */
      setState(UploadChapterState.UPLOADED)

      toast.success(`Capítulo ${position} upado!`, { id: toastId })
    }).catch(() => null)

    methods.reset(methods.getValues())
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <BulkUploadChaptersFormFields />
    </Form.Component>
  )
}
