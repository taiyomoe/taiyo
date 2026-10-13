import { Calendar } from "@taiyomoe/ui/components/ui/calendar"
import { useState } from "react"
import preview from "@/storybook/preview"

type DateRange = {
  from: Date | undefined
  to?: Date | undefined
}

const meta = preview.meta({
  title: "UI/Calendar",
  component: Calendar,
  parameters: { layout: "centered" },
})

function SingleCalendar() {
  const [selected, setSelected] = useState<Date | undefined>(new Date())

  return <Calendar mode="single" onSelect={setSelected} selected={selected} />
}

function MultipleCalendar() {
  const [selected, setSelected] = useState<Date[] | undefined>([new Date()])

  return <Calendar mode="multiple" onSelect={setSelected} selected={selected} />
}

function RangeCalendar() {
  const today = new Date()
  const inAWeek = new Date(today)

  inAWeek.setDate(today.getDate() + 6)
  const [selected, setSelected] = useState<DateRange | undefined>({
    from: today,
    to: inAWeek,
  })

  return <Calendar mode="range" onSelect={setSelected} selected={selected} />
}

export const Default = meta.story({
  render: () => <SingleCalendar />,
})

export const Multiple = meta.story({
  render: () => <MultipleCalendar />,
})

export const Range = meta.story({
  render: () => <RangeCalendar />,
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
