import type { DB, Kysely } from "@taiyomoe/db"
import {
  adminAudit,
  anonymousActor,
  type AuditActionEntry,
  authAudit,
  userActor,
  userAudit,
} from "@taiyomoe/audit"
import { createMiddleware } from "hono/factory"
import { z } from "zod"
import { auditChanges, resolveAuditOutcome } from "../utils/audit"

const AUTH_BASE_PATH = "/api/auth"
const NEW_USER_TOLERANCE_MS = 1000
const auditedAuthPaths: Record<string, AuditActionEntry> = {
  "/sign-up/email": authAudit.SIGN_UP,
  "/sign-in/email": authAudit.SIGN_IN,
  "/sign-in/username": authAudit.SIGN_IN,
  "/sign-in/social": authAudit.SOCIAL_SIGN_IN_START,
  "/sign-in/magic-link": authAudit.MAGIC_LINK_REQUEST,
  "/magic-link/verify": authAudit.SIGN_IN,
  "/callback/:id": authAudit.SIGN_IN,
  "/sign-out": authAudit.SIGN_OUT,
  "/verify-email": authAudit.EMAIL_VERIFY,
  "/send-verification-email": authAudit.VERIFICATION_EMAIL_SEND,
  "/request-password-reset": authAudit.PASSWORD_RESET_REQUEST,
  "/reset-password": authAudit.PASSWORD_RESET,
  "/change-password": authAudit.PASSWORD_CHANGE,
  "/verify-password": authAudit.PASSWORD_VERIFY,
  "/change-email": authAudit.EMAIL_CHANGE,
  "/update-session": authAudit.SESSION_UPDATE,
  "/revoke-session": authAudit.SESSION_REVOKE,
  "/revoke-sessions": authAudit.SESSIONS_REVOKE,
  "/revoke-other-sessions": authAudit.OTHER_SESSIONS_REVOKE,
  "/link-social": authAudit.ACCOUNT_LINK,
  "/unlink-account": authAudit.ACCOUNT_UNLINK,
  "/refresh-token": authAudit.TOKEN_REFRESH,
  "/get-access-token": authAudit.ACCESS_TOKEN_READ,
  "/update-user": userAudit.PROFILE_UPDATE,
  "/delete-user": userAudit.DELETE,
  "/delete-user/callback": userAudit.DELETE,
  "/admin/create-user": adminAudit.USER_CREATE,
  "/admin/update-user": adminAudit.USER_UPDATE,
  "/admin/remove-user": adminAudit.USER_REMOVE,
  "/admin/set-role": adminAudit.ROLE_SET,
  "/admin/ban-user": adminAudit.USER_BAN,
  "/admin/unban-user": adminAudit.USER_UNBAN,
  "/admin/impersonate-user": adminAudit.USER_IMPERSONATE,
  "/admin/stop-impersonating": adminAudit.IMPERSONATION_STOP,
  "/admin/revoke-user-session": adminAudit.USER_SESSION_REVOKE,
  "/admin/revoke-user-sessions": adminAudit.USER_SESSIONS_REVOKE,
  "/admin/set-user-password": adminAudit.USER_PASSWORD_SET,
  "/admin/list-users": adminAudit.USER_LIST,
  "/admin/get-user": adminAudit.USER_GET,
  "/admin/list-user-sessions": adminAudit.USER_SESSIONS_LIST,
}
const signInMethods: Record<string, string> = {
  "/sign-up/email": "email",
  "/sign-in/email": "email",
  "/sign-in/username": "username",
  "/magic-link/verify": "magic-link",
}
const responseUserPaths = new Set(["/sign-up/email", "/sign-in/email", "/sign-in/username"])
const snapshotPaths = new Set([
  "/update-user",
  "/change-email",
  "/verify-email",
  "/admin/update-user",
  "/admin/set-role",
  "/admin/ban-user",
  "/admin/unban-user",
])
const selfTargetedAdminPaths = new Set(["/admin/list-users", "/admin/stop-impersonating"])
const requestBodySchema = z
  .object({
    userId: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    provider: z.string().optional(),
  })
  .catch({})
const responseBodySchema = z
  .object({
    code: z.string().optional(),
    message: z.string().optional(),
    user: z.object({ id: z.string() }).optional(),
  })
  .catch({})
const toAuthPath = (requestPath: string) => {
  const path = requestPath.slice(AUTH_BASE_PATH.length)

  return path.startsWith("/callback/") ? "/callback/:id" : path
}
const readJson = async (message: Request | Response): Promise<unknown> => {
  if (!(message.headers.get("content-type") ?? "").includes("application/json")) {
    return {}
  }

  return message
    .clone()
    .json()
    .catch(() => ({}))
}
const readRedirectError = (response: Response) => {
  const location = response.headers.get("location")

  if (response.status < 300 || response.status >= 400 || location === null) {
    return undefined
  }

  return new URL(location, "http://localhost").searchParams.get("error") ?? undefined
}
const getUserSnapshot = (db: Kysely<DB>, userId: string) =>
  db
    .selectFrom("users")
    .select([
      "id",
      "name",
      "username",
      "displayUsername",
      "email",
      "emailVerified",
      "image",
      "role",
      "banned",
      "banReason",
      "banExpires",
      "createdAt",
    ])
    .where("id", "=", userId)
    .executeTakeFirst()
const findUserIdByIdentifier = async (
  db: Kysely<DB>,
  { email, username }: { email?: string | undefined; username?: string | undefined },
) => {
  if (email === undefined && username === undefined) {
    return undefined
  }

  const row = await db
    .selectFrom("users")
    .select("id")
    .where(email === undefined ? "username" : "email", "=", (email ?? username ?? "").toLowerCase())
    .executeTakeFirst()

  return row?.id
}

export const auditAuthRequest = createMiddleware(async (c, next) => {
  const path = toAuthPath(c.req.path)
  const entry = auditedAuthPaths[path]

  if (entry === undefined) {
    return next()
  }

  const { auth, db, log } = c.var
  const startedAt = Date.now()
  const body = requestBodySchema.parse(await readJson(c.req.raw))
  const isAdminPath = path.startsWith("/admin/") && !selfTargetedAdminPaths.has(path)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  const requestedUserId = isAdminPath ? (body.userId ?? c.req.query("id")) : session?.user.id
  const userBefore =
    snapshotPaths.has(path) && requestedUserId !== undefined
      ? await getUserSnapshot(db, requestedUserId)
      : undefined

  await next()

  const redirectError = readRedirectError(c.res)
  const outcome = redirectError === undefined ? resolveAuditOutcome(c.res.status) : "failure"
  const response = responseBodySchema.parse(
    outcome === "success" && !responseUserPaths.has(path) && path !== "/admin/create-user"
      ? {}
      : await readJson(c.res),
  )
  const responseUserId = response.user?.id
  const createdUserId = path === "/admin/create-user" ? responseUserId : undefined
  let signedInUserId = session === null && outcome === "success" ? responseUserId : undefined

  if (session === null && outcome === "success" && signedInUserId === undefined) {
    const cookie = c.res.headers
      .getSetCookie()
      .map((value) => value.split(";")[0] ?? "")
      .join("; ")
    const signedIn =
      cookie === "" ? null : await auth.api.getSession({ headers: new Headers({ cookie }) })

    signedInUserId = signedIn?.user.id
  }

  const signedInUser =
    signedInUserId === undefined ? undefined : await getUserSnapshot(db, signedInUserId)
  const actor = session?.user ?? signedInUser
  const targetId =
    createdUserId ??
    (isAdminPath ? requestedUserId : actor?.id) ??
    (await findUserIdByIdentifier(db, body))
  const isNewSocialUser =
    path === "/callback/:id" &&
    signedInUser !== undefined &&
    signedInUser.createdAt.getTime() >= startedAt - NEW_USER_TOLERANCE_MS
  const userAfter =
    userBefore !== undefined && targetId !== undefined && outcome === "success"
      ? await getUserSnapshot(db, targetId)
      : undefined
  const changes =
    userBefore !== undefined && userAfter !== undefined
      ? auditChanges(userBefore, userAfter)
      : undefined
  const method =
    signInMethods[path] ?? (path === "/callback/:id" ? c.req.path.split("/").at(-1) : body.provider)
  const reason =
    outcome === "success" ? undefined : (redirectError ?? response.code ?? response.message)
  const action = isNewSocialUser ? authAudit.SIGN_UP : entry

  log.audit({
    action: action.action,
    actor: actor === undefined ? anonymousActor : userActor(actor, session?.session),
    outcome,
    ...(typeof action.target === "string" && targetId !== undefined
      ? {
          target: {
            type: action.target,
            id: targetId,
            ...(method === undefined ? {} : { method }),
          },
        }
      : {}),
    ...(reason === undefined ? {} : { reason }),
    ...(changes === undefined ? {} : { changes }),
  })
})
