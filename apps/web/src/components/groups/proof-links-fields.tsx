import * as stylex from "@stylexjs/stylex"
import { Close, Link, Plus } from "@taiyomoe/ui/components/icons"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { useFieldArray, useFormContext } from "react-hook-form"
import { z } from "zod"
import { InputField } from "@/components/fields/form-field"
import { m } from "@/paraglide/messages"

const MAX_PROOF_LINKS = 5

export const proofLinksSchema = z
  .object({
    value: z.url({ protocol: /^https?$/, error: m.proof_links_invalid() }),
  })
  .array()
  .min(1, m.proof_links_required())
  .max(MAX_PROOF_LINKS)

type ProofLinksForm = { proofLinks: Array<{ value: string }> }

const styles = stylex.create({
  list: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  row: {
    gap: "0.5rem",
    alignItems: "flex-start",
    display: "flex",
  },
  input: {
    flexGrow: 1,
    minWidth: 0,
  },
  icon: {
    color: colors.mutedForeground,
  },
  add: {
    alignSelf: "flex-start",
  },
})

export function ProofLinksFields() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProofLinksForm>()
  const links = useFieldArray({ control, name: "proofLinks" })

  return (
    <Field invalid={errors.proofLinks?.root !== undefined}>
      <FieldLabel>{m.proof_links_label()}</FieldLabel>
      <div sx={styles.list}>
        {links.fields.map((link, index) => (
          <div key={link.id} sx={styles.row}>
            <div sx={styles.input}>
              <InputField
                control={control}
                inputMode="url"
                name={`proofLinks.${index}.value`}
                placeholder="https://"
                startIcon={<Link {...stylex.props(styles.icon)} />}
              />
            </div>
            {links.fields.length > 1 ? (
              <Button
                aria-label={m.proof_links_remove()}
                onClick={() => {
                  links.remove(index)
                }}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Close />
              </Button>
            ) : null}
          </div>
        ))}
        {links.fields.length < MAX_PROOF_LINKS ? (
          <Button
            onClick={() => {
              links.append({ value: "" })
            }}
            size="sm"
            sx={styles.add}
            type="button"
            variant="ghost"
          >
            <Plus />
            {m.proof_links_add()}
          </Button>
        ) : null}
      </div>
      <FieldDescription>{m.proof_links_description()}</FieldDescription>
      {errors.proofLinks?.root?.message === undefined ? null : (
        <FieldError match>{errors.proofLinks.root.message}</FieldError>
      )}
    </Field>
  )
}
