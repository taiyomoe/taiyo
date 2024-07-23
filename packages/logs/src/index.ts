import { createClient } from "@clickhouse/client"
import { env } from "../env"

export const client = createClient({
  url: env.CLICKHOUSE_URL,
  username: env.CLICKHOUSE_USERNAME,
  password: env.CLICKHOUSE_PASSWORD,
})
