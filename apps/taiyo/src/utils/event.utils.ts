type GenericMessage = {
  step: number
  content: string
  type: string
  timestamp: Date
}

const generateStep =
  (messages: GenericMessage[]) =>
  (
    stepIndex: number,
    defaultMessage: string,
    description?: React.ReactNode,
  ) => {
    const message = messages
      .filter((m) => m.step === stepIndex)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .pop()

    if (!message || message.type === "error")
      return {
        title: defaultMessage,
        hasError: message?.type === "error",
        description,
      }

    return { title: message.content, hasError: false, description }
  }

export const EventUtils = {
  generateStep,
}
