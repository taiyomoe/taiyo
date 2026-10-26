import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@taiyomoe/ui/components/ui/button"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Group, GroupUpdateInput } from "@/features/groups/api/groups"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField, TextareaField } from "@/components/fields/form-field"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const link = z.union([
  z.literal(""),
  z.url({ protocol: /^https?$/, error: m.proof_links_invalid() }),
])
const settingsSchema = z.object({
  name: z.string().trim().min(1, m.request_group_name_required()).max(200),
  description: z.string().trim().max(5000),
  website: link,
  discord: z.string().trim().max(500),
  x: link,
  facebook: link,
  instagram: link,
  telegram: link,
  youtube: link,
  email: z.union([z.literal(""), z.email()]),
})
const LINK_FIELDS = [
  ["website", m.group_link_website],
  ["discord", m.group_link_discord],
  ["x", m.group_link_x],
  ["facebook", m.group_link_facebook],
  ["instagram", m.group_link_instagram],
  ["telegram", m.group_link_telegram],
  ["youtube", m.group_link_youtube],
  ["email", m.group_link_email],
] as const
const styles = stylex.create({
  form: {
    padding: "1.5rem",
    borderColor: colors.border,
    borderRadius: radius.xxl,
    borderStyle: "solid",
    borderWidth: 1,
    gap: "1.25rem",
    backgroundColor: colors.card,
    display: "flex",
    flexDirection: "column",
  },
  heading: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 600,
  },
  description: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
  links: {
    gap: "1rem",
    display: "grid",
    gridTemplateColumns: { default: "1fr", "@media (width >= 48rem)": "1fr 1fr" },
  },
  footer: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-end",
  },
  saved: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
})

export function GroupSettingsPanel({ group }: { group: Group }) {
  const queryClient = useQueryClient()
  const update = useMutation({
    mutationFn: async (json: GroupUpdateInput) =>
      ensureSuccess(await api.groups[":id"].$patch({ param: { id: group.id }, json })),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
        queryClient.invalidateQueries({ queryKey: ["me", "groups"] }),
      ]),
  })
  const form = useForm({
    resolver: zodResolver(settingsSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: group.name,
      description: group.description ?? "",
      website: group.website ?? "",
      discord: group.discord ?? "",
      x: group.x ?? "",
      facebook: group.facebook ?? "",
      instagram: group.instagram ?? "",
      telegram: group.telegram ?? "",
      youtube: group.youtube ?? "",
      email: group.email ?? "",
    },
  })
  const onSubmit = form.handleSubmit(async (values) => {
    await update.mutateAsync({
      name: values.name,
      description: values.description === "" ? null : values.description,
      website: values.website === "" ? null : values.website,
      discord: values.discord === "" ? null : values.discord,
      x: values.x === "" ? null : values.x,
      facebook: values.facebook === "" ? null : values.facebook,
      instagram: values.instagram === "" ? null : values.instagram,
      telegram: values.telegram === "" ? null : values.telegram,
      youtube: values.youtube === "" ? null : values.youtube,
      email: values.email === "" ? null : values.email,
    })
    form.reset(values)
  })

  return (
    <Form
      noValidate
      onSubmit={(event) => {
        void onSubmit(event).catch(() => {})
      }}
      sx={styles.form}
    >
      <div>
        <h2 sx={styles.heading}>{m.settings_title()}</h2>
        <p sx={styles.description}>{m.settings_description()}</p>
      </div>
      <ErrorAlert message={update.isError ? getErrorMessage(update.error) : null} />
      <InputField control={form.control} label={m.settings_name()} name="name" />
      <TextareaField
        control={form.control}
        label={m.settings_description_label()}
        name="description"
        rows={4}
      />
      <div sx={styles.links}>
        {LINK_FIELDS.map(([name, label]) => (
          <InputField
            control={form.control}
            key={name}
            label={label()}
            name={name}
            placeholder={name === "email" ? "team@example.com" : "https://"}
          />
        ))}
      </div>
      <div sx={styles.footer}>
        {update.isSuccess && !form.formState.isDirty ? (
          <span sx={styles.saved}>{m.saved()}</span>
        ) : null}
        <Button disabled={form.formState.isSubmitting || !form.formState.isDirty} type="submit">
          {m.save()}
        </Button>
      </div>
    </Form>
  )
}
