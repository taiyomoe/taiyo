import { auth, toNextJsHandler } from "@taiyomoe/auth/server"

export const { POST, GET } = toNextJsHandler(auth)
