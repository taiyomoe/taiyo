import { type HTMLAttributes, useState } from "react"
import type { z } from "zod"
import { Input } from "~/components/ui/input"
import { cn } from "~/utils/cn"

type Props = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  inputClassName?: string
  validation: z.ZodSchema
  onChange: (value: string) => void
}

export const EditText = ({
  className,
  inputClassName,
  validation,
  onChange,
  ...props
}: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = () => {
    const result = validation
      ? validation.safeParse(inputValue)
      : { success: true, data: inputValue }

    if (!result.success) {
      return
    }

    onChange?.(result.data)
    setIsEditing(false)
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setInputValue("")
    }
  }

  const handleBlur = () => {
    if (inputValue) {
      handleSubmit()

      return
    }

    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Input
        className={inputClassName}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
      />
    )
  }

  return (
    <div
      className={cn(
        "hover:cursor-pointer [&_svg]:text-subtle hover:[&_svg]:text-default",
        className,
      )}
      onClick={() => setIsEditing(true)}
      {...props}
    />
  )
}
