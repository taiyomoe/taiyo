import { tv } from "@nextui-org/react"

type Props = {
  number: number
  title: string
  content?: React.ReactNode
  children?: React.ReactNode
}

const stepperItem = tv({
  slots: {
    container: "flex gap-6",
    number:
      "!w-12 !h-12 flex flex-col items-center justify-center rounded-full bg-content3 font-semibold text-2xl",
    title: "mt-1.5 font-bold text-3xl",
    content: "flex w-full flex-col gap-6",
  },
})

export const StepperItem = (props: Props) => {
  const { number, title, content, children } = props
  const slots = stepperItem()

  return (
    <div className={slots.container()}>
      <div>
        <span className={slots.number()}>{number}</span>
      </div>
      <div className={slots.content()}>
        <h2 className={slots.title()}>{title}</h2>
        {content ?? children}
      </div>
    </div>
  )
}
