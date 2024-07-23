export type Migration = {
  id: string
  startedAt: Date
  finishedAt: Date | null
  migrationName: string
}
