"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type CreateMediaInput, createMediaSchema } from "@taiyomoe/schemas"
import { useRouter } from "next/navigation"
import { tryit } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { useErrorHandler } from "~/hooks/useErrorHandler"
import { S3Service } from "~/services/s3.web-service"
import { api } from "~/trpc/react"
import { CreateMediaFormFields } from "./create-media-form-fields"

export const CreateMediaForm = () => {
  const { mutateAsync: requestPresignedUrls } = api.medias.create.useMutation()
  const { mutateAsync: commitUpload } = api.medias.commit.useMutation()
  const { handleErrorRaw } = useErrorHandler()
  const router = useRouter()
  const methods = useForm<CreateMediaInput>({
    resolver: zodResolver(createMediaSchema),
    mode: "onTouched",
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      synopsis: "",
      oneShot: false,
      contentRating: "NORMAL",
      type: "MANGA",
      status: "RELEASING",
      source: "ORIGINAL",
      demography: "SHOUNEN",
      countryOfOrigin: "JAPAN",
      flag: "OK",
      genres: [],
      tags: [],
      mdId: undefined,
      alId: undefined,
      malId: undefined,
      mainTitle: "",
      mainTitleLanguage: "en",
      mainCover: undefined,
      mainCoverLanguage: "en",
      mainCoverContentRating: "NORMAL",
      mainCoverVolume: undefined,
    },
  })

  const handleSubmit: SubmitHandler<CreateMediaInput> = async (values) => {
    /**
     * 1. Ask for presigned urls
     */
    const toastId = toast.loading("Gerando o link de upload da cover...")
    const [getUrlError, getUrlResult] = await tryit(requestPresignedUrls)({
      ...values,
      mainCover: { ...values.mainCover, file: undefined },
    })

    if (getUrlError) {
      return handleErrorRaw(
        getUrlError,
        "Ocorreu um erro inesperado ao gerar o link de upload da cover",
        toastId,
      )
    }

    /**
     * 2. Upload files to S3 Bucket
     */
    toast.loading("Upando a cover na Cloudflare...", { id: toastId })

    const { id, url } = getUrlResult
    const file = { ...values.mainCover, file: values.mainCover.file!, url }
    const [uploadedFile] = await S3Service.upload([file], () => {
      toast.error(
        "Ocorreu um erro inesperado ao upar a cover na Cloudflare. Cancelando a criação...",
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

    const [commitError] = await tryit(commitUpload)(id)

    if (commitError) {
      return handleErrorRaw(
        commitError,
        "Ocorreu um erro inesperado ao indicar ao servidor que a cover foi upada",
        toastId,
      )
    }

    /**
     * 4. Redirect to media page
     */
    router.push(`/media/${id}`)

    toast.success("Obra criada!", { id: toastId })
  }

  return (
    <Form.Component onSubmit={handleSubmit} {...methods}>
      <CreateMediaFormFields />
    </Form.Component>
  )
}
