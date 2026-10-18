import type { ReactElement } from "react"
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
  DialogTrigger,
} from "@taiyomoe/ui/components/ui/dialog"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { AuthAlert } from "@/components/auth/auth-alert"
import { InputField, TextareaField } from "@/components/fields/form-field"
import { ProofLinksFields, proofLinksSchema } from "@/components/groups/proof-links-fields"
import { getErrorMessage } from "@/lib/errors"
import { useRequestGroup } from "@/lib/queries/groups"
import { m } from "@/paraglide/messages"

const requestSchema = z.object({
  name: z.string().trim().min(1, m.request_group_name_required()).max(200),
  description: z.string().trim().max(5000),
  message: z.string().trim().min(1, m.message_required()).max(2000),
  proofLinks: proofLinksSchema,
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

export function RequestGroupDialog({ trigger }: { trigger: ReactElement }) {
  const [open, setOpen] = useState(false)
  const request = useRequestGroup()
  const form = useForm({
    resolver: zodResolver(requestSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { name: "", description: "", message: "", proofLinks: [{ value: "" }] },
  })
  const onSubmit = form.handleSubmit(async ({ name, description, message, proofLinks }) => {
    await request.mutateAsync({
      name,
      description: description === "" ? null : description,
      message,
      proofLinks: proofLinks.map((link) => link.value),
    })
    setOpen(false)
    form.reset()
  })

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        request.reset()
      }}
      open={open}
    >
      <DialogTrigger render={trigger} />
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
              <DialogTitle>{m.request_group_title()}</DialogTitle>
              <DialogDescription>{m.request_group_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div sx={styles.fields}>
                <AuthAlert message={request.isError ? getErrorMessage(request.error) : null} />
                <InputField
                  control={form.control}
                  label={m.request_group_name()}
                  name="name"
                  placeholder="Akira Scans"
                />
                <TextareaField
                  control={form.control}
                  label={m.request_group_about()}
                  name="description"
                  placeholder={m.request_group_about_placeholder()}
                  rows={3}
                />
                <TextareaField
                  control={form.control}
                  label={m.claim_message_label()}
                  name="message"
                  placeholder={m.request_group_message_placeholder()}
                  rows={3}
                />
                <ProofLinksFields />
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                {m.cancel()}
              </DialogClose>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {m.request_group_submit()}
              </Button>
            </DialogFooter>
          </Form>
        </FormProvider>
      </DialogPopup>
    </Dialog>
  )
}
