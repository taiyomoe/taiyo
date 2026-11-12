import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { breakpoints } from "@taiyomoe/ui/styles/tokens.stylex"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { UnsavedChangesGuard } from "@/components/dialogs/unsaved-changes-guard"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField, TextareaField } from "@/components/fields/form-field"
import { type ListDetail, useCreateList, useUpdateList } from "@/features/lists/api/lists"
import { EditorBar } from "@/features/lists/components/list-editor/editor-bar"
import { listEditorStyles } from "@/features/lists/components/list-editor/list-editor-styles"
import { TitlesPanel } from "@/features/lists/components/list-editor/titles-panel"
import { VisibilityField } from "@/features/lists/components/list-editor/visibility-field"
import {
  type EditorTitle,
  type ListDetailsValues,
  listDetailsSchema,
} from "@/features/lists/lib/list-editor"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  layout: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
  fields: {
    gap: "1.25rem",
    alignItems: "start",
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.md]: "repeat(2, minmax(0, 1fr))",
    },
  },
  wide: {
    gridColumn: { default: null, [breakpoints.md]: "1 / -1" },
  },
})

export function ListEditor({ list }: { list: ListDetail | null }) {
  const navigate = useNavigate()
  const create = useCreateList()
  const update = useUpdateList()
  const mutation = list === null ? create : update
  const [initialItems] = useState<EditorTitle[]>(
    () =>
      list?.items.map((item) => ({
        mediaId: item.mediaId,
        title: item.title,
        coverUrl: item.coverUrl,
        type: item.type,
      })) ?? [],
  )
  const [items, setItems] = useState(initialItems)
  const form = useForm<ListDetailsValues>({
    resolver: zodResolver(listDetailsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: list?.name ?? "",
      description: list?.description ?? "",
      visibility: list?.visibility ?? "PRIVATE",
    },
  })
  const submitting = form.formState.isSubmitting
  const dirty =
    form.formState.isDirty ||
    items.length !== initialItems.length ||
    items.some((item, index) => item.mediaId !== initialItems[index]?.mediaId)
  const onSubmit = form.handleSubmit(async ({ name, description, visibility }) => {
    const values = {
      name,
      description: description === "" ? null : description,
      visibility,
      mediaIds: items.map((item) => item.mediaId),
    }
    const id =
      list === null
        ? (await create.mutateAsync(values)).id
        : (await update.mutateAsync({ id: list.id, ...values })).id

    toastManager.add({
      title: list === null ? m.list_editor_created() : m.list_editor_saved(),
      type: "success",
    })
    await navigate({ to: "/lists/$listId", params: { listId: id }, ignoreBlocker: true })
  })

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        void onSubmit(event).catch(() => {})
      }}
      sx={styles.layout}
    >
      <section sx={listEditorStyles.panel}>
        <h2 sx={listEditorStyles.panelTitle}>{m.list_editor_details()}</h2>
        <ErrorAlert message={mutation.isError ? getErrorMessage(mutation.error) : null} />
        <div sx={styles.fields}>
          <InputField
            control={form.control}
            label={m.list_editor_name()}
            name="name"
            placeholder={m.list_editor_name_placeholder()}
          />
          <VisibilityField control={form.control} />
          <div sx={styles.wide}>
            <TextareaField
              control={form.control}
              label={m.list_editor_description()}
              name="description"
              placeholder={m.list_editor_description_placeholder()}
              rows={2}
            />
          </div>
        </div>
      </section>
      <TitlesPanel disabled={submitting} items={items} onChange={setItems} />
      <EditorBar list={list} submitting={submitting} />
      <UnsavedChangesGuard dirty={dirty} />
    </Form>
  )
}
