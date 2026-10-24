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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import type { ClaimInput } from "@/lib/queries/groups"
import { AuthAlert } from "@/components/auth/auth-alert"
import { TextareaField } from "@/components/fields/form-field"
import { ProofLinksFields, proofLinksSchema } from "@/components/groups/proof-links-fields"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const claimSchema = z.object({
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

type ClaimGroupDialogProps = {
  group: { id: string; name: string }
  trigger: ReactElement
  onClaimed: () => void
}

export function ClaimGroupDialog({ group, trigger, onClaimed }: ClaimGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const claim = useMutation({
    mutationFn: async (json: ClaimInput) =>
      ensureSuccess(
        await api.groups[":id"]["ownership-requests"].$post({ param: { id: group.id }, json }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me", "ownership-requests"] }),
  })
  const form = useForm({
    resolver: zodResolver(claimSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { message: "", proofLinks: [{ value: "" }] },
  })
  const onSubmit = form.handleSubmit(async ({ message, proofLinks }) => {
    await claim.mutateAsync({ message, proofLinks: proofLinks.map((link) => link.value) })
    setOpen(false)
    form.reset()
    onClaimed()
  })

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next)
        claim.reset()
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
              <DialogTitle>{m.claim_dialog_title({ name: group.name })}</DialogTitle>
              <DialogDescription>{m.claim_dialog_description()}</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <div sx={styles.fields}>
                <AuthAlert message={claim.isError ? getErrorMessage(claim.error) : null} />
                <TextareaField
                  control={form.control}
                  label={m.claim_message_label()}
                  name="message"
                  placeholder={m.claim_message_placeholder()}
                  rows={4}
                />
                <ProofLinksFields />
              </div>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                {m.cancel()}
              </DialogClose>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {m.claim_submit()}
              </Button>
            </DialogFooter>
          </Form>
        </FormProvider>
      </DialogPopup>
    </Dialog>
  )
}
