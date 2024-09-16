export type GenericMessage = {
  step: number
  itemIndex: number
  content: string
  type: "ongoing" | "success" | "error"
  timestamp: Date
}
