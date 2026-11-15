import type { Role } from "@taiyomoe/permissions"
import type { InferResponseType } from "hono/client"
import type { api } from "@/lib/api"

export const USERS_PER_PAGE = 25

export type UsersFilter = {
  search?: string | undefined
  role?: Role | undefined
  banned?: boolean | undefined
  page: number
}

export type ManagedUser = InferResponseType<typeof api.users.$get, 200>["data"][number]
