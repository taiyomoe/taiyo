import { CheckIcon } from "lucide-react"
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps,
} from "react-aria-components"

type Props = CheckboxProps & { children?: React.ReactNode }

export const Checkbox = ({ children, ...props }: Props) => {
  return (
    <AriaCheckbox
      className="group flex items-center gap-2 hover:cursor-pointer"
      {...props}
    >
      <div className="flex size-4.5 items-center justify-center rounded-sm border transition group-hover:border-emphasis group-data-[selected]:bg-primary group-data-[selected]:text-inverted">
        <CheckIcon className="size-3.5 stroke-3 opacity-0 transition-opacity group-data-[selected]:opacity-100" />
      </div>
      {children}
    </AriaCheckbox>
  )
}
