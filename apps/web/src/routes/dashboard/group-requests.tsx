import type { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Link as LinkIcon,
} from "@taiyomoe/ui/components/icons"
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@taiyomoe/ui/components/ui/empty"
import { Field, FieldError, FieldLabel } from "@taiyomoe/ui/components/ui/field"
import { Skeleton } from "@taiyomoe/ui/components/ui/skeleton"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@taiyomoe/ui/components/ui/tabs"
import { Textarea } from "@taiyomoe/ui/components/ui/textarea"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { useState } from "react"
import type { GroupCreationRequest, OwnershipRequest } from "@/features/groups/api/groups"
import { ErrorAlert } from "@/components/feedback/error-alert"
import { DashboardPage } from "@/components/layout/dashboard-page"
import { TimeAgo } from "@/components/time/time-ago"
import { GroupAvatar, PersonAvatar } from "@/features/groups/components/group-avatar"
import { api } from "@/lib/api"
import { ensureSuccess, unwrapEnvelope } from "@/lib/envelope"
import { getErrorMessage } from "@/lib/errors"
import { getPermissions } from "@/lib/permissions"
import { m } from "@/paraglide/messages"

const REVIEW_PER_PAGE = 20
const styles = stylex.create({
  tabs: {
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
  },
  count: {
    color: colors.mutedForeground,
    fontVariantNumeric: "tabular-nums",
    marginInlineStart: "0.375rem",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: "1rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  card: {
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
  top: {
    gap: "0.875rem",
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  sentence: {
    gap: "0.375rem",
    alignItems: "baseline",
    display: "flex",
    flexGrow: 1,
    flexWrap: "wrap",
    minWidth: 0,
  },
  strong: {
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  verb: {
    color: colors.mutedForeground,
  },
  target: {
    gap: "0.75rem",
    alignItems: "center",
    display: "flex",
  },
  targetName: {
    textDecoration: "none",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    fontSize: "1.125rem",
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  time: {
    color: colors.mutedForeground,
    fontSize: "0.875rem",
  },
  quote: {
    margin: 0,
    padding: "1rem",
    borderRadius: `calc(${radius.xxl} - 0.75rem)`,
    backgroundColor: `color-mix(in srgb, ${colors.foreground} 3%, transparent)`,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    overflowWrap: "anywhere",
    whiteSpace: "pre-line",
  },
  about: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    whiteSpace: "pre-line",
  },
  proof: {
    gap: "0.5rem",
    display: "flex",
    flexDirection: "column",
  },
  proofTitle: {
    margin: 0,
    color: colors.mutedForeground,
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  proofList: {
    margin: 0,
    padding: 0,
    gap: "0.375rem",
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
  },
  proofLink: {
    gap: "0.5rem",
    alignItems: "center",
    color: {
      default: colors.foreground,
      ":hover": `color-mix(in srgb, ${colors.foreground} 75%, ${colors.background})`,
    },
    display: "inline-flex",
    fontSize: "0.9375rem",
    overflowWrap: "anywhere",
  },
  proofIcon: {
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  warning: {
    gap: "0.5rem",
    alignItems: "center",
    color: colors.warning,
    display: "flex",
    fontSize: "0.875rem",
  },
  actions: {
    gap: "0.5rem",
    display: "flex",
    justifyContent: "flex-end",
  },
  skeleton: {
    borderRadius: radius.xxl,
    height: "14rem",
  },
})

export const Route = createFileRoute("/dashboard/group-requests")({
  head: () => ({ meta: [{ title: m.review_meta_title() }] }),
  beforeLoad: ({ context }) => {
    if (!getPermissions(context.session.user)("ownershipRequest.review")) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: function GroupRequestsPage() {
    const claims = useQuery({
      queryKey: ["ownership-requests", { page: 1 }],
      queryFn: async ({ signal }) =>
        unwrapEnvelope(
          await api["ownership-requests"].$get(
            { query: { page: "1", perPage: String(REVIEW_PER_PAGE) } },
            { init: { signal } },
          ),
        ),
    })
    const creations = useQuery({
      queryKey: ["group-creation-requests", { page: 1 }],
      queryFn: async ({ signal }) =>
        unwrapEnvelope(
          await api["group-creation-requests"].$get(
            { query: { page: "1", perPage: String(REVIEW_PER_PAGE) } },
            { init: { signal } },
          ),
        ),
    })

    return (
      <DashboardPage subtitle={m.review_subtitle()} title={m.review_title()}>
        <Tabs defaultValue="claims" sx={styles.tabs}>
          <TabsList variant="underline">
            <TabsTab value="claims">
              {m.review_tab_claims()}
              {claims.data === undefined ? null : (
                <span sx={styles.count}>{claims.data.meta.total}</span>
              )}
            </TabsTab>
            <TabsTab value="creations">
              {m.review_tab_new_groups()}
              {creations.data === undefined ? null : (
                <span sx={styles.count}>{creations.data.meta.total}</span>
              )}
            </TabsTab>
          </TabsList>
          <TabsPanel value="claims">
            <RequestList
              items={claims.data?.data}
              render={(request) => <ClaimCard key={request.id} request={request} />}
            />
          </TabsPanel>
          <TabsPanel value="creations">
            <RequestList
              items={creations.data?.data}
              render={(request) => <CreationCard key={request.id} request={request} />}
            />
          </TabsPanel>
        </Tabs>
      </DashboardPage>
    )
  },
})

function RequestList<T>({
  items,
  render,
}: {
  items: T[] | undefined
  render: (item: T) => ReactNode
}) {
  if (items === undefined) {
    return <Skeleton sx={styles.skeleton} />
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle />
          </EmptyMedia>
          <EmptyTitle>{m.review_empty_title()}</EmptyTitle>
          <EmptyDescription>{m.review_empty_description()}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return <ul sx={styles.list}>{items.map(render)}</ul>
}

function ProofLinks({ links }: { links: readonly string[] }) {
  return (
    <div sx={styles.proof}>
      <p sx={styles.proofTitle}>{m.review_proof()}</p>
      <ul sx={styles.proofList}>
        {links
          .filter((link) => /^https?:\/\//.test(link))
          .map((link) => (
            <li key={link}>
              <a
                href={link}
                rel="noopener noreferrer nofollow"
                sx={styles.proofLink}
                target="_blank"
              >
                <LinkIcon size={16} {...stylex.props(styles.proofIcon)} />
                {link}
                <ExternalLink size={14} {...stylex.props(styles.proofIcon)} />
              </a>
            </li>
          ))}
      </ul>
    </div>
  )
}

function Requester({ person, verb }: { person: OwnershipRequest["requester"]; verb: string }) {
  return (
    <>
      <PersonAvatar person={person} />
      <div sx={styles.sentence}>
        <span sx={styles.strong}>{person.displayUsername}</span>
        <span sx={styles.verb}>{verb}</span>
      </div>
    </>
  )
}

function ClaimCard({ request }: { request: OwnershipRequest }) {
  const queryClient = useQueryClient()
  const review = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string | null }) =>
      ensureSuccess(
        note === null
          ? await api["ownership-requests"][":id"].approve.$post({ param: { id } })
          : await api["ownership-requests"][":id"].reject.$post({ param: { id }, json: { note } }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["ownership-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
      ]),
  })

  return (
    <li sx={styles.card}>
      <div sx={styles.top}>
        <Requester person={request.requester} verb={m.review_wants_to_claim()} />
        <TimeAgo date={request.createdAt} sx={styles.time} />
      </div>
      <div sx={styles.target}>
        <GroupAvatar id={request.group.id} name={request.group.name} />
        <Link
          params={{ groupId: request.group.id }}
          {...stylex.props(styles.targetName)}
          to="/groups/$groupId"
        >
          {request.group.name}
        </Link>
      </div>
      {request.message === null ? null : <p sx={styles.quote}>{request.message}</p>}
      {request.proofLinks.length === 0 ? null : <ProofLinks links={request.proofLinks} />}
      {request.group.owned ? (
        <div sx={styles.warning}>
          <AlertTriangle size={16} />
          {m.review_already_owned()}
        </div>
      ) : null}
      <ReviewActions
        approveDisabled={request.group.owned}
        error={review.isError ? getErrorMessage(review.error) : null}
        onApprove={() => review.mutateAsync({ id: request.id, note: null })}
        onReject={(note) => review.mutateAsync({ id: request.id, note })}
        pending={review.isPending}
      />
    </li>
  )
}

function CreationCard({ request }: { request: GroupCreationRequest }) {
  const queryClient = useQueryClient()
  const review = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string | null }) =>
      ensureSuccess(
        note === null
          ? await api["group-creation-requests"][":id"].approve.$post({ param: { id } })
          : await api["group-creation-requests"][":id"].reject.$post({
              param: { id },
              json: { note },
            }),
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["group-creation-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["groups"] }),
      ]),
  })

  return (
    <li sx={styles.card}>
      <div sx={styles.top}>
        <Requester person={request.requester} verb={m.review_wants_to_create()} />
        <TimeAgo date={request.createdAt} sx={styles.time} />
      </div>
      <div sx={styles.target}>
        <GroupAvatar id={request.id} name={request.name} />
        <span sx={styles.targetName}>{request.name}</span>
      </div>
      {request.description === null ? null : <p sx={styles.about}>{request.description}</p>}
      <p sx={styles.quote}>{request.message}</p>
      <ProofLinks links={request.proofLinks} />
      {request.nameTaken ? (
        <div sx={styles.warning}>
          <AlertTriangle size={16} />
          {m.review_name_taken()}
        </div>
      ) : null}
      <ReviewActions
        approveDisabled={request.nameTaken}
        error={review.isError ? getErrorMessage(review.error) : null}
        onApprove={() => review.mutateAsync({ id: request.id, note: null })}
        onReject={(note) => review.mutateAsync({ id: request.id, note })}
        pending={review.isPending}
      />
    </li>
  )
}

type ReviewActionsProps = {
  approveDisabled: boolean
  error: string | null
  pending: boolean
  onApprove: () => Promise<unknown>
  onReject: (note: string) => Promise<unknown>
}

function ReviewActions({
  approveDisabled,
  error,
  pending,
  onApprove,
  onReject,
}: ReviewActionsProps) {
  const [rejecting, setRejecting] = useState(false)
  const [note, setNote] = useState("")
  const [touched, setTouched] = useState(false)
  const missingNote = note.trim() === ""

  return (
    <>
      {rejecting ? null : <ErrorAlert message={error} />}
      <div sx={styles.actions}>
        <Button
          disabled={pending}
          onClick={() => {
            setRejecting(true)
          }}
          variant="outline"
        >
          {m.review_reject()}
        </Button>
        <Button
          disabled={pending || approveDisabled}
          onClick={() => {
            void onApprove().catch(() => {})
          }}
        >
          {m.review_approve()}
        </Button>
      </div>
      <Dialog onOpenChange={setRejecting} open={rejecting}>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>{m.review_reject_title()}</DialogTitle>
            <DialogDescription>{m.review_reject_description()}</DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <ErrorAlert message={error} />
            <Field invalid={touched && missingNote}>
              <FieldLabel>{m.review_reject_note()}</FieldLabel>
              <Textarea
                onBlur={() => {
                  setTouched(true)
                }}
                onChange={(event) => {
                  setNote(event.target.value)
                }}
                placeholder={m.review_reject_note_placeholder()}
                rows={4}
                value={note}
              />
              {touched && missingNote ? (
                <FieldError match>{m.review_reject_note_required()}</FieldError>
              ) : null}
            </Field>
          </DialogPanel>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{m.cancel()}</DialogClose>
            <Button
              disabled={pending}
              onClick={() => {
                setTouched(true)

                if (missingNote) {
                  return
                }

                void onReject(note.trim())
                  .then(() => {
                    setRejecting(false)
                  })
                  .catch(() => {})
              }}
              variant="destructive"
            >
              {m.review_reject()}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </>
  )
}
