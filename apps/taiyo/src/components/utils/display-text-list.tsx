import { Fragment, type HTMLAttributes } from "react"

type Props = {
  items: { label: string | number; value: string | number }[]
  prefix: string
} & HTMLAttributes<HTMLSpanElement>

export const DisplayTextList = ({ items, prefix, ...rest }: Props) => (
  <p>
    {prefix}
    {items.map(({ label, value }, i) => (
      <Fragment key={value}>
        <span {...rest}>{label}</span>
        {i < items.length - 1 ? ", " : ""}
      </Fragment>
    ))}
  </p>
)
