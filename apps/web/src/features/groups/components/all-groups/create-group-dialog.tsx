import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { Plus } from "@taiyomoe/ui/components/icons"
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
  DialogTrigger,
} from "@taiyomoe/ui/components/ui/dialog"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { toastManager } from "@taiyomoe/ui/components/ui/toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField, RichTextField } from "@/components/fields/form-field"
import { PageAction } from "@/components/filters/filter-toolbar"
import { api } from "@/lib/api"
import { unwrap } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const createSchema = z.object({
  name: z.string().trim().min(1, m.request_group_name_required()).max(200),
  description: z.string().trim().max(5000),
})
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

export function CreateGroupDialog() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const create = useMutation({
    mutationFn: async (json: { name: string; description: string | null }) =>
      unwrap(await api.groups.$post({ json })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  })
  const form = useForm({
    resolver: zodResolver(createSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", description: "" },
  })
  const onSubmit = form.handleSubmit(async ({ name, description }) => {
    const { id } = await create.mutateAsync({
      name,
      description: description === "" ? null : description,
    })

    setOpen(false)
    form.reset()
    toastManager.add({ title: m.all_groups_created({ name }), type: "success" })
    await navigate({
      to: "/dashboard/groups/$groupId",
      params: { groupId: id },
      search: { tab: "settings" },
    })
  })

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        create.reset()
      }}
      open={open}
    >
      <DialogTrigger
        render={
          <PageAction>
            <Plus />
            {m.all_groups_create()}
          </PageAction>
        }
      />
      <DialogPopup>
        <FormProvider {...form}>
          <Form
            sx={styles.form}
            noValidate
            onSubmit={(event) => {
              void onSubmit(event).catch(() => {})
            }}
          >
            <DialogHeader>
              <DialogTitle>{m.all_groups_create()}</DialogTitle>
              <DialogDescription>{m.all_groups_create_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div sx={styles.fields}>
                <ErrorAlert message={create.isError ? getErrorMessage(create.error) : null} />
                <InputField
                  control={form.control}
                  label={m.request_group_name()}
                  name="name"
                  placeholder="Akira Scans"
                />
                <RichTextField
                  control={form.control}
                  label={m.request_group_about()}
                  name="description"
                  placeholder={m.request_group_about_placeholder()}
                  rows={3}
                />
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                {m.cancel()}
              </DialogClose>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {m.all_groups_create_submit()}
              </Button>
            </DialogFooter>
          </Form>
        </FormProvider>
      </DialogPopup>
    </Dialog>
  )
}
