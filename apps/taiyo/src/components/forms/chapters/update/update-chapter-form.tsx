"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { UpdateMediaChapterSchema } from "@taiyomoe/schemas"
import { updateMediaChapterSchema } from "@taiyomoe/schemas"
import type { MediaChapterWithRelations } from "@taiyomoe/types"
import { pick } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/new-form"
import { ObjectUtils } from "~/lib/utils/object.utils"
import { api } from "~/trpc/react"
import { UpdateChapterFormFields } from "./update-chapter-form-fields"

type Props = {
  chapter: MediaChapterWithRelations
}

export const UpdateChapterForm = ({ chapter }: Props) => {
  const { mutateAsync } = api.mediaChapters.update.useMutation()
  const initialValues = {
    ...pick(chapter, [
      "id",
      "title",
      "number",
      "volume",
      "contentRating",
      "flag",
      "language",
    ]),
    scanIds: chapter.scans.map((s) => s.id),
  }
  const methods = useForm<UpdateMediaChapterSchema>({
    resolver: zodResolver(updateMediaChapterSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })

  const handleSubmit: SubmitHandler<UpdateMediaChapterSchema> = (values) => {
    const delta = ObjectUtils.deepDifference(values, initialValues)
    const payload = {
      id: values.id,
      ...delta,
      scanIds: values.scanIds,
    }

    console.log("values", values)
    console.log("payload", payload)

    toast.promise(mutateAsync(payload), {
      loading: "Salvando alterações...",
      success: () => {
        methods.reset(values)

        return "Alterações salvas com sucesso!"
      },
      error: "Não foi possível salvar as alterações.",
    })
  }

  return (
    <Form.Component {...methods} onSubmit={handleSubmit}>
      <UpdateChapterFormFields
        scans={chapter.scans.map((s) => ({ label: s.name, value: s.id }))}
      />
    </Form.Component>
  )
}
