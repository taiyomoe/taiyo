import { rawLogsClient } from ".."

const up = async () => {
  await rawLogsClient.command({
    query:
      "ALTER TABLE logs.chapters MODIFY COLUMN type Enum8('created' = 1, 'updated' = 2, 'deleted' = 3, 'restored' = 4);",
  })
}

export default {
  name: "20240907145502_add_chapters_restoration",
  up,
}
