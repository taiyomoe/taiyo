"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import type { UpdateChapterInput } from "@taiyomoe/schemas"
import { updateChapterSchema } from "@taiyomoe/schemas"
import type { MediaChapterWithRelations } from "@taiyomoe/types"
import { ObjectUtils } from "@taiyomoe/utils"
import { pick } from "radash"
import { type SubmitHandler, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Form } from "~/components/generics/form/form"
import { api } from "~/trpc/react"
import { UpdateChapterFormFields } from "./update-chapter-form-fields"

type Props = {
  chapter: MediaChapterWithRelations
}

export const UpdateChapterForm = ({ chapter }: Props) => {
  const { mutateAsync } = api.chapters.update.useMutation()
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
  const methods = useForm<UpdateChapterInput>({
    resolver: zodResolver(updateChapterSchema),
    defaultValues: initialValues,
    mode: "onTouched",
  })

  const handleSubmit: SubmitHandler<UpdateChapterInput> = (values) => {
    const delta = ObjectUtils.deepDiff(values, initialValues)
    const payload = {
      id: values.id,
      ...delta,
      scanIds: values.scanIds,
    }

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
