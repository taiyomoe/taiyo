import { Input } from "@taiyomoe/ui/components/input"
import { cn } from "@taiyomoe/ui/utils/cn"
import { type HTMLAttributes, useState } from "react"
import type { z } from "zod"

type Props = Omit<HTMLAttributes<HTMLButtonElement>, "onChange"> & {
  inputClassName?: string
  validation: z.ZodSchema<string | number>
  onChange: (value: string | number) => void
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
    <button
      className={cn(
        "hover:cursor-pointer [&_svg]:text-subtle hover:[&_svg]:text-default",
        className,
      )}
      onClick={() => setIsEditing(true)}
      type="button"
      {...props}
    />
  )
}
