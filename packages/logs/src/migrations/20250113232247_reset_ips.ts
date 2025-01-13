import { rawLogsClient } from "../raw-client"

const up = async () => {
  await rawLogsClient.command({
    query: "ALTER TABLE logs.usersAuth MODIFY COLUMN ip Nullable(String);",
  })

  await rawLogsClient.command({
    query: "ALTER TABLE logs.usersAuth UPDATE ip = NULL WHERE 1 = 1;",
  })
}

export default {
  name: "20250113232247_reset_ips",
  up,
}
