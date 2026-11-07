const copyWithSelection = (text: string) => {
  const textarea = document.createElement("textarea")

  textarea.value = text
  textarea.setAttribute("readonly", "")
  Object.assign(textarea.style, { position: "fixed", opacity: "0", pointerEvents: "none" })
  document.body.append(textarea)
  textarea.select()

  try {
    // oxlint-disable-next-line typescript/no-deprecated
    return document.execCommand("copy")
  } finally {
    textarea.remove()
  }
}

export const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)

    return true
  } catch {
    return copyWithSelection(text)
  }
}
