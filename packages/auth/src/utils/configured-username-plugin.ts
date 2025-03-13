import { username } from "better-auth/plugins"

export const configuredUsernamePlugin = username({
  minUsernameLength: 3,
  maxUsernameLength: 30,
})
