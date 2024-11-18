import { zodResolver } from "@hookform/resolvers/zod"
import {
  type UploadCoverInput,
  type UploadCoversInput,
  uploadCoversSchema,
} from "@taiyomoe/schemas"
import { parallel, tryit } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { S3Service } from "~/services/s3.web-service"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"
import { UploadCoversFormFields } from "./upload-covers-form-fields"

type Props = {
  mediaId: string
}

export const UploadCoversForm = ({ mediaId }: Props) => {
  const { mutateAsync: requestPresignedUrls } = api.covers.upload.useMutation()
  const { mutateAsync: commitUpload } = api.covers.commit.useMutation()
  const { handleErrorRaw } = useErrorHandler()
  const { addCover } = useMediaUpdateStore()
  const methods = useForm<UploadCoversInput>({
    resolver: zodResolver(uploadCoversSchema),
    mode: "onTouched",
    defaultValues: {
      covers: [],
      mediaId,
    },
  })

  const handleSubmit: SubmitHandler<UploadCoversInput> = async (values) => {
    await parallel(10, values.covers, async (cover) => {
      const index = values.covers.findIndex(
        (c) => c.file.name === cover.file.name,
      )
      const position = `${index + 1}/${values.covers.length}`
      const data: UploadCoverInput = { ...cover, mediaId: values.mediaId }

      /**
       * 1. Ask for presigned urls
       */
      const toastId = toast.loading(
        `Gerando os links de upload do capítulo ${position}...`,
      )
      const [getUrlError, getUrlResult] = await tryit(requestPresignedUrls)({
        ...data,
        file: { ...data.file, file: undefined },
      })

      if (getUrlError) {
        return handleErrorRaw(
          getUrlError,
          `Ocorreu um erro inesperado ao gerar o link de upload da cover ${position}`,
          toastId,
        )
      }

      /**
       * 2. Upload files to S3 Bucket
       */
      toast.loading("Upando a cover na Cloudflare...", { id: toastId })

      const { id, url } = getUrlResult
      const file = { ...cover.file, file: cover.file.file!, url }
      const [uploadedFile] = await S3Service.upload([file], () => {
        toast.error(
          `Ocorreu um erro inesperado ao upar a cover ${position} na Cloudflare`,
          { id: toastId },
        )
      })

      if (!uploadedFile) {
        return
      }

      /**
       * 3. Commit upload
       */
      toast.loading("Servidor processando a cover...", {
        id: toastId,
      })

      const [commitError, uploadedCover] = await tryit(commitUpload)(id)

      if (commitError) {
        return handleErrorRaw(
          commitError,
          `Ocorreu um erro inesperado ao indicar ao servidor que a cover ${position} foi upada`,
          toastId,
        )
      }

      console.log("uploadedCover", uploadedCover)

      /**
       * 4. Add the cover to the store
       */
      addCover([uploadedCover])

      toast.success(`Cover ${position} upada!`, { id: toastId })
    })

    methods.reset({ covers: [] })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UploadCoversFormFields />
    </Form.Component>
  )
}
