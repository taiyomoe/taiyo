import { Card, CardBody, CardHeader } from "@nextui-org/card"
import type { ReactNode } from "react"
import { NumberTicker } from "~/components/generics/texts/number-ticker"

type Props = {
  label: string
  value: number
  icon: ReactNode
}

export const TaskOverviewCard = ({ label, value, icon }: Props) => {
  return (
    <Card className="min-w-60 sm:last:col-span-2 lg:last:col-auto">
      <CardHeader className="select-none justify-between pb-0 text-default-500">
        <p>{label}</p>
        {icon}
      </CardHeader>
      <CardBody>
        <p className="whitespace-pre-wrap font-medium text-3xl tracking-tighter">
          {value === 0 && "0"}
          {value !== 0 && <NumberTicker value={value} />}
        </p>
      </CardBody>
    </Card>
  )
}
