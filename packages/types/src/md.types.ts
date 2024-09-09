export type ImportMediaEventMessage = {
  step: number
  itemIndex: number
  content: string
  type: "ongoing" | "success" | "error"
  timestamp: Date
}
