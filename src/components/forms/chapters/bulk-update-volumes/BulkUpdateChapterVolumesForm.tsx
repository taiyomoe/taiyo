"use client"

import { MediaChapter } from "@prisma/client"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { toFormikValidationSchema } from "zod-formik-adapter"

import { Form } from "~/components/generics/form/Form"
import {
  BulkUpdateMediaChapterVolumesSchema,
  bulkUpdateMediaChapterVolumesSchema,
} from "~/lib/schemas"
import { api } from "~/lib/trpc/client"
import { FormSubmit } from "~/lib/types"
import { MediaChapterUtils } from "~/lib/utils/mediaChapter.utils"

import { TRPCClientError } from "@trpc/client"
import { BulkUpdateChapterVolumesFormFields } from "./BulkUpdateChapterVolumesFormFields"

type Props = {
  chapters: MediaChapter[]
}

export const BulkUpdateChapterVolumesForm = ({ chapters }: Props) => {
  const { mutateAsync } = api.mediaChapters.updateVolumes.useMutation()
  const router = useRouter()
  const pathname = usePathname()

  const initialValues: BulkUpdateMediaChapterVolumesSchema = [
    { volume: 1, ids: [] },
  ]

  const handleSubmit: FormSubmit<BulkUpdateMediaChapterVolumesSchema> = async (
    values,
    helpers,
  ) => {
    const duplicatedChapters = MediaChapterUtils.getDuplicatedChapters(
      values,
      chapters,
    )

    if (duplicatedChapters.length) {
      const errorMessage = `Os capítulos seguintes estão presentes em mais de 1 volume: ${duplicatedChapters.join(
        ", ",
      )}`

      helpers.setErrors([{ ids: errorMessage }])
      toast.error(errorMessage, { duration: 10000 })

      return
    }

    toast.promise(mutateAsync(values), {
      loading: "Atualizando capítulos...",
      success: () => {
        router.push(pathname.replace("/volumes", "/scans"))

        return "Capítulos atualizados com sucesso."
      },
      error: (error) => {
        if (error instanceof TRPCClientError) {
          return error.message
        }

        return "Erro ao atualizar capítulos."
      },
    })
  }

  return (
    <Form.Component
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(
        bulkUpdateMediaChapterVolumesSchema,
      )}
      onSubmit={handleSubmit}
    >
      <BulkUpdateChapterVolumesFormFields chapters={chapters} />
    </Form.Component>
  )
}
