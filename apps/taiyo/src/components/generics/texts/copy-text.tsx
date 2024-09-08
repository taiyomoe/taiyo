import { Button } from "@nextui-org/button"
import { Tooltip } from "@nextui-org/tooltip"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { useCopyToClipboard } from "usehooks-ts"

type Props = {
  text: string
}

export const CopyText = ({ text }: Props) => {
  const [, copy] = useCopyToClipboard()
  const [copied, setCopied] = useState(false)

  const handlePress = () => {
    copy(text)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <Tooltip
      className="text-foreground"
      content={copied ? "Copiado!" : "Copiar"}
    >
      <Button
        className="h-7 w-7 min-w-7 text-default-400"
        size="sm"
        variant="light"
        onPress={handlePress}
        isIconOnly
      >
        {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
      </Button>
    </Tooltip>
  )
}
