export type ImportMediaEventMessage = {
  step: number
  content: string
  type: "ongoing" | "success" | "error"
}
