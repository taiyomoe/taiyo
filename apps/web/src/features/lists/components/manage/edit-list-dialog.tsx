import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@taiyomoe/ui/components/ui/dialog"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useForm } from "react-hook-form"
import type { ManagedList } from "@/features/lists/api/managed-lists"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField, TextareaField } from "@/components/fields/form-field"
import { useUpdateList } from "@/features/lists/api/lists"
import { VisibilityField } from "@/features/lists/components/list-editor/visibility-field"
import { type ListDetailsValues, listDetailsSchema } from "@/features/lists/lib/list-editor"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const styles = stylex.create({
  form: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "100%",
    minHeight: 0,
  },
  fields: {
    gap: "1.25rem",
    display: "flex",
    flexDirection: "column",
  },
})

/** Edits the name, description and visibility of someone's list, the way its owner would. */
export function EditListDialog({ list, onClose }: { list: ManagedList; onClose: () => void }) {
  const update = useUpdateList()
  const form = useForm<ListDetailsValues>({
    resolver: zodResolver(listDetailsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: list.name,
      description: list.description ?? "",
      visibility: list.visibility,
    },
  })
  const onSubmit = form.handleSubmit(async ({ name, description, visibility }) => {
    if (form.formState.isDirty) {
      await update.mutateAsync({
        id: list.id,
        name,
        description: description === "" ? null : description,
        visibility,
      })
      toastManager.add({ title: m.list_editor_saved(), type: "success" })
    }

    onClose()
  })

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open
    >
      <DialogPopup>
        <Form
          noValidate
          onSubmit={(event) => {
            void onSubmit(event).catch(() => {})
          }}
          sx={styles.form}
        >
          <DialogHeader>
            <DialogTitle>{m.list_editor_edit_title()}</DialogTitle>
            <DialogDescription>{m.lists_manage_edit_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={styles.fields}>
              <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
              <InputField
                control={form.control}
                label={m.list_editor_name()}
                name="name"
                placeholder={m.list_editor_name_placeholder()}
              />
              <TextareaField
                control={form.control}
                label={m.list_editor_description()}
                name="description"
                placeholder={m.list_editor_description_placeholder()}
                rows={3}
              />
              <VisibilityField
                control={form.control}
                hints={{
                  PUBLIC: m.list_editor_visibility_public_hint_staff(),
                  PRIVATE: m.lists_manage_private_hint(),
                }}
              />
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {m.cancel()}
            </DialogClose>
            <Button loading={form.formState.isSubmitting} type="submit">
              {m.list_editor_save()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
