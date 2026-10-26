import { zodResolver } from "@hookform/resolvers/zod"
import * as stylex from "@stylexjs/stylex"
import { Plus, Search, Users } from "@taiyomoe/ui/components/icons"
import { Badge, type BadgeVariant } from "@taiyomoe/ui/components/ui/badge"
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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Form } from "@taiyomoe/ui/components/ui/form"
import { colors } from "@taiyomoe/ui/styles/tokens.stylex"
import { noop, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { z } from "zod"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { InputField, TextareaField } from "@/components/fields/form-field"
import {
  DashboardPage,
  DashboardSection,
  ListCard,
  ListRow,
} from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import {
  type GroupCreationInput,
  type MyOwnershipRequest,
  myGroupCreationRequestsQueryOptions,
  myGroupsQueryOptions,
  myOwnershipRequestsQueryOptions,
} from "@/features/groups/api/groups"
import { GroupAvatar } from "@/features/groups/components/group-avatar"
import { MemberPermissions, RoleBadge } from "@/features/groups/components/group-permissions"
import { ProofLinksFields, proofLinksSchema } from "@/features/groups/components/proof-links-fields"
import { api } from "@/lib/api"
import { ensureSuccess } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { m } from "@/paraglide/messages"

const requestSchema = z.object({
  name: z.string().trim().min(1, m.request_group_name_required()).max(200),
  description: z.string().trim().max(5000),
  message: z.string().trim().min(1, m.message_required()).max(2000),
  proofLinks: proofLinksSchema,
})
const REQUEST_STATUS: Record<
  MyOwnershipRequest["status"],
  { label: () => string; variant: BadgeVariant }
> = {
  PENDING: { label: m.request_status_pending, variant: "warning" },
  APPROVED: { label: m.request_status_approved, variant: "success" },
  REJECTED: { label: m.request_status_rejected, variant: "error" },
  CANCELLED: { label: m.request_status_cancelled, variant: "outline" },
}
const styles = stylex.create({
  main: {
    gap: "0.375rem",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  titleLine: {
    gap: "0.5rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  name: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  meta: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.mutedForeground,
    display: "flex",
    flexWrap: "wrap",
    fontSize: "0.875rem",
  },
  note: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
    fontStyle: "italic",
    overflowWrap: "anywhere",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    flexShrink: 0,
  },
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

export const Route = createFileRoute("/dashboard/groups/")({
  head: () => ({ meta: [{ title: m.my_groups_meta_title() }] }),
  loader: async ({ context }) => {
    const prefetch = Promise.all(
      [
        context.queryClient.query(myGroupsQueryOptions),
        context.queryClient.query(myOwnershipRequestsQueryOptions),
        context.queryClient.query(myGroupCreationRequestsQueryOptions),
      ].map((query) => query.catch(noop)),
    )

    if (import.meta.env.SSR) {
      await prefetch
    }
  },
  component: function MyGroupsPage() {
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const request = useMutation({
      mutationFn: async (json: GroupCreationInput) =>
        ensureSuccess(await api["group-creation-requests"].$post({ json })),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["me", "group-creation-requests"] }),
    })
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
    const { data: groups } = useSuspenseQuery(myGroupsQueryOptions)
    const { data: claims } = useSuspenseQuery(myOwnershipRequestsQueryOptions)
    const { data: creations } = useSuspenseQuery(myGroupCreationRequestsQueryOptions)
    const cancelClaim = useMutation({
      mutationFn: async (id: string) =>
        ensureSuccess(await api["ownership-requests"][":id"].$delete({ param: { id } })),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me", "ownership-requests"] }),
    })
    const cancelCreation = useMutation({
      mutationFn: async (id: string) =>
        ensureSuccess(await api["group-creation-requests"][":id"].$delete({ param: { id } })),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["me", "group-creation-requests"] }),
    })
    const rows = [
      ...claims.map((claim) => ({
        id: claim.id,
        kind: "claim" as const,
        name: claim.group.name,
        groupId: claim.groupId,
        status: claim.status,
        note: claim.reviewerNote,
        createdAt: claim.createdAt,
      })),
      ...creations.map((creation) => ({
        id: creation.id,
        kind: "creation" as const,
        name: creation.name,
        groupId: creation.groupId,
        status: creation.status,
        note: creation.reviewerNote,
        createdAt: creation.createdAt,
      })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    return (
      <DashboardPage
        actions={
          <>
            <Button render={<Link to="/groups" />} variant="outline">
              <Search />
              {m.my_groups_find()}
            </Button>
            <Dialog
              onOpenChange={(next) => {
                setOpen(next)
                request.reset()
              }}
              open={open}
            >
              <DialogTrigger
                render={
                  <Button>
                    <Plus />
                    {m.request_group_title()}
                  </Button>
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
                      <DialogTitle>{m.request_group_title()}</DialogTitle>
                      <DialogDescription>{m.request_group_description()}</DialogDescription>
                    </DialogHeader>
                    <DialogPanel>
                      <div sx={styles.fields}>
                        <ErrorAlert
                          message={request.isError ? getErrorMessage(request.error) : null}
                        />
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
          </>
        }
        subtitle={m.my_groups_subtitle()}
        title={m.my_groups_title()}
      >
        <DashboardSection title={m.my_groups_section()}>
          {groups.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users />
                </EmptyMedia>
                <EmptyTitle>{m.my_groups_empty_title()}</EmptyTitle>
                <EmptyDescription>{m.my_groups_empty_description()}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button render={<Link to="/groups" />} variant="outline">
                  {m.my_groups_find()}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ListCard>
              {groups.map(({ group, role, permissions, memberCount }) => (
                <ListRow key={group.id}>
                  <GroupAvatar id={group.id} name={group.name} />
                  <div sx={styles.main}>
                    <div sx={styles.titleLine}>
                      <Link
                        params={{ groupId: group.id }}
                        {...stylex.props(styles.name)}
                        to="/groups/$groupId"
                      >
                        {group.name}
                      </Link>
                      <RoleBadge role={role} />
                    </div>
                    <div sx={styles.meta}>
                      <span>
                        {memberCount === 1
                          ? m.my_groups_member()
                          : m.my_groups_members({ count: memberCount })}
                      </span>
                    </div>
                    <MemberPermissions permissions={permissions} role={role} showOwner />
                  </div>
                  <div sx={styles.actions}>
                    <Button
                      render={
                        <Link params={{ groupId: group.id }} to="/dashboard/groups/$groupId" />
                      }
                      size="sm"
                      variant="outline"
                    >
                      {m.my_groups_manage()}
                    </Button>
                  </div>
                </ListRow>
              ))}
            </ListCard>
          )}
        </DashboardSection>
        {rows.length === 0 ? null : (
          <DashboardSection title={m.my_requests_section()}>
            <ListCard>
              {rows.map((row) => (
                <ListRow key={row.id}>
                  <GroupAvatar id={row.groupId ?? row.id} name={row.name} />
                  <div sx={styles.main}>
                    <div sx={styles.titleLine}>
                      {row.groupId === null ? (
                        <span sx={styles.name}>{row.name}</span>
                      ) : (
                        <Link
                          params={{ groupId: row.groupId }}
                          {...stylex.props(styles.name)}
                          to="/groups/$groupId"
                        >
                          {row.name}
                        </Link>
                      )}
                      <Badge variant={REQUEST_STATUS[row.status].variant}>
                        {REQUEST_STATUS[row.status].label()}
                      </Badge>
                    </div>
                    <div sx={styles.meta}>
                      <span>
                        {row.kind === "claim" ? m.my_requests_claim() : m.my_requests_new_group()}
                      </span>
                      <span aria-hidden>·</span>
                      <TimeAgo date={row.createdAt} />
                    </div>
                    {row.note === null ? null : (
                      <span sx={styles.note}>{m.request_review_note({ note: row.note })}</span>
                    )}
                  </div>
                  {row.status === "PENDING" ? (
                    <div sx={styles.actions}>
                      <Button
                        disabled={cancelClaim.isPending || cancelCreation.isPending}
                        onClick={() => {
                          if (row.kind === "claim") {
                            cancelClaim.mutate(row.id)
                          } else {
                            cancelCreation.mutate(row.id)
                          }
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        {m.request_cancel()}
                      </Button>
                    </div>
                  ) : null}
                </ListRow>
              ))}
            </ListCard>
          </DashboardSection>
        )}
      </DashboardPage>
    )
  },
})
