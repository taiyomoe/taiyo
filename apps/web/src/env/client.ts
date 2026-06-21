import { createEnv } from "@t3-oss/env-core"
import { clientEnv as authEnv } from "@taiyomoe/auth/env-client"

export const env = createEnv({
  extends: [authEnv],
  clientPrefix: "VITE_",
  client: {},
  runtimeEnv: import.meta.env,
})
