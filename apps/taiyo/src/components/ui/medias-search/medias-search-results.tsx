import { Command } from "cmdk"

export const MediasSearchResults = () => (
  <Command.Group heading="Obras" className="w-4/5 bg-emerald-600">
    <Command.Empty>No results found.</Command.Empty>
    <Command.Item>a</Command.Item>
    <Command.Item>b</Command.Item>
    <Command.Separator />
    <Command.Item>c</Command.Item>
  </Command.Group>
)
