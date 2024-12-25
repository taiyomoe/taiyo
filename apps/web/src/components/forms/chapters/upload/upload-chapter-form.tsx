"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type UploadChapterInput, uploadChapterSchema } from "@taiyomoe/schemas"
import { tryit } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { S3Service } from "~/services/s3.web-service"
import { api } from "~/trpc/react"
import { UploadChapterFormFields } from "./upload-chapter-form-fields"

export const UploadChapterForm = () => {
  const { mutateAsync: requestPresignedUrls } =
    api.chapters.upload.useMutation()
  const { mutateAsync: commitUpload } = api.chapters.commit.useMutation()
  const { handleErrorRaw } = useErrorHandler()
  const methods = useForm<UploadChapterInput>({
    resolver: zodResolver(uploadChapterSchema),
    mode: "onTouched",
    defaultValues: {
      title: undefined,
      number: 0,
      volume: undefined,
      contentRating: "NORMAL",
      flag: "OK",
      language: "pt_br",
      scanIds: [],
      files: [],
    },
  })

  const handleSubmit: SubmitHandler<UploadChapterInput> = async (values) => {
    /**
     * 1. Ask for presigned urls
     */
    const toastId = toast.loading("Gerando os links de upload...")
    const [getUrlsError, getUrlsResult] = await tryit(requestPresignedUrls)({
      ...values,
      files: values.files.map(({ file: _, ...f }) => f),
    })

    if (getUrlsError) {
      return handleErrorRaw(
        getUrlsError,
        "Ocorreu um erro inesperado ao gerar os links de upload",
        toastId,
      )
    }

    /**
     * 2. Upload files to S3 Bucket
     */
    toast.loading("Upando os ficheiros na Cloudflare...", { id: toastId })

    const { id, urls } = getUrlsResult
    const files = values.files.map((f, i) => ({
      ...f,
      file: f.file!,
      url: urls[i]!,
    }))
    const uploadedFiles = await S3Service.upload(files, (name) => {
      toast.error(
        `Ocorreu um erro inesperado ao upar o ficheiro '${name}'. Cancelando o upload...`,
        { id: toastId },
      )
    })

    if (uploadedFiles.includes(null)) {
      return
    }

    /**
     * 3. Commit upload
     */
    toast.loading("Servidor processando o capítulo...", {
      id: toastId,
    })

    const [commitError] = await tryit(commitUpload)(id)

    if (commitError) {
      return handleErrorRaw(
        commitError,
        `Ocorreu um erro inesperado ao indicar ao servidor que o capítulo '${id}' foi upado`,
        toastId,
      )
    }

    /**
     * 4. Reset form while incrementing the chapter number
     */
    const coercedNumber = Number(values.number)
    const newNumber = Number.isInteger(coercedNumber)
      ? coercedNumber + uploadedFiles.length
      : coercedNumber + 0.5

    methods.reset({
      ...values,
      number: newNumber,
      files: [],
    })

    toast.success("Capítulo upado!", { id: toastId })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UploadChapterFormFields />
    </Form.Component>
  )
}
