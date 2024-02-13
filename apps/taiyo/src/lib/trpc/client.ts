import { createTRPCReact } from "@trpc/react-query"

import type { AppRouter } from "~/lib/server/root"

export const api = createTRPCReact<AppRouter>()
