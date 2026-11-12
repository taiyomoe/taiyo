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
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField } from "@/components/fields/form-field"
import { useCreateList } from "@/features/lists/api/lists"
import { VisibilityField } from "@/features/lists/components/list-editor/visibility-field"
import { type ListDetailsValues, listDetailsSchema } from "@/features/lists/lib/list-editor"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const DEFAULT_VALUES: ListDetailsValues = { name: "", description: "", visibility: "PRIVATE" }
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

export function CreateListDialog({
  mediaId,
  mediaTitle,
  open,
  onOpenChange,
}: {
  mediaId: string
  mediaTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const create = useCreateList()
  const form = useForm<ListDetailsValues>({
    resolver: zodResolver(listDetailsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_VALUES,
  })
  const onSubmit = form.handleSubmit(async ({ name, visibility }) => {
    await create.mutateAsync({ name, visibility, mediaIds: [mediaId] })
    toastManager.add({ title: m.media_lists_added({ name }), type: "success" })
    onOpenChange(false)
    form.reset(DEFAULT_VALUES)
  })

  return (
    <Dialog
      onOpenChange={(next) => {
        onOpenChange(next)
        create.reset()
      }}
      open={open}
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
            <DialogTitle>{m.list_editor_new_title()}</DialogTitle>
            <DialogDescription>
              {m.create_list_dialog_description({ title: mediaTitle })}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <div sx={styles.fields}>
              <ErrorAlert message={create.isError ? getErrorMessage(create.error) : null} />
              <InputField
                control={form.control}
                label={m.list_editor_name()}
                name="name"
                placeholder={m.list_editor_name_placeholder()}
              />
              <VisibilityField control={form.control} />
            </div>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              {m.cancel()}
            </DialogClose>
            <Button loading={form.formState.isSubmitting} type="submit">
              {m.list_editor_create()}
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  )
}
