"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react"
import {
  type DetailedHTMLProps,
  type InputHTMLAttributes,
  useState,
} from "react"
import { cn } from "~/utils/cn"
import { Input } from "./input"

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

export const PasswordInput = ({ className, ...props }: Props) => {
  const [show, setShow] = useState(false)
  const Icon = show ? EyeIcon : EyeOffIcon

  return (
    <div className="group flex rounded transition focus:ring-2 focus:ring-primary">
      <Input
        className={cn("rounded-r-none border-r-0 focus:ring-0", className)}
        type={show ? "text" : "password"}
        autoComplete="new-password"
        {...props}
      />
      <div
        onClick={() => setShow(!show)}
        className="h-9 rounded-r border bg-default p-2 transition hover:cursor-pointer hover:bg-muted group-hover:border-emphasis"
      >
        <Icon className="size-5 text-muted" />
      </div>
    </div>
  )
}
