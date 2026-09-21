import preview from "@/storybook/preview"
import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { useState } from "react"

type DateRange = { from: Date | undefined; to?: Date | undefined }

const meta = preview.meta({
  title: "UI/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
})

export const Default = meta.story({
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(new Date())

    return <Calendar mode="single" onSelect={setSelected} selected={selected} />
  },
})

export const Multiple = meta.story({
  render: () => {
    const [selected, setSelected] = useState<Date[] | undefined>([new Date()])

    return <Calendar mode="multiple" onSelect={setSelected} selected={selected} />
  },
})

export const Range = meta.story({
  render: () => {
    const today = new Date()
    const inAWeek = new Date(today)

    inAWeek.setDate(today.getDate() + 6)
    const [selected, setSelected] = useState<DateRange | undefined>({
      from: today,
      to: inAWeek,
    })

    return <Calendar mode="range" onSelect={setSelected} selected={selected} />
  },
})

export const WithDropdownNavigation = meta.story({
  render: () => <Calendar captionLayout="dropdown" defaultMonth={new Date()} mode="single" />,
})

export const WithoutOutsideDays = meta.story({
  render: () => <Calendar mode="single" showOutsideDays={false} />,
})

export const Disabled = meta.story({
  render: () => <Calendar disabled mode="single" />,
})
