import { createTRPCReact } from "@trpc/react-query";

import type { AppRouter } from "@taiyo/api";

export const api = createTRPCReact<AppRouter>();

export { type RouterInputs, type RouterOutputs } from "@taiyo/api";
