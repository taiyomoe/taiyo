import { createClient } from "@clickhouse/client-web"
import { env } from "./env"

export const rawLogsClient = createClient({
  url: env.CLICKHOUSE_URL,
  clickhouse_settings: {
    allow_experimental_object_type: 1,
    date_time_input_format: "best_effort",
  },
})
