import preview from "@/storybook/preview"
import { Badge } from "@taiyomoe/ui/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@taiyomoe/ui/components/ui/table"

type Status = "Paid" | "Unpaid" | "Pending" | "Failed"

type Project = {
  name: string
  status: Status
  team: string
  budget: string
}

const STATUS_DOT: Record<Status, string> = {
  Paid: "bg-emerald-500",
  Unpaid: "bg-muted-foreground/64",
  Pending: "bg-amber-500",
  Failed: "bg-red-500",
}
const projects: Project[] = [
  { name: "Website Redesign", status: "Paid", team: "Frontend Team", budget: "$12,500" },
  { name: "Mobile App", status: "Unpaid", team: "Mobile Team", budget: "$8,750" },
  { name: "API Integration", status: "Pending", team: "Backend Team", budget: "$5,200" },
  { name: "Database Migration", status: "Paid", team: "DevOps Team", budget: "$3,800" },
  { name: "User Dashboard", status: "Paid", team: "UX Team", budget: "$7,200" },
  { name: "Security Audit", status: "Failed", team: "Security Team", budget: "$2,100" },
]
const meta = preview.meta({
  title: "UI/Table",
  component: Table,
  parameters: { layout: "padded" },
})

export const Default = meta.story({
  render: () => (
    <Table>
      <TableCaption>A list of current projects.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.name}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
                />
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.team}</TableCell>
            <TableCell className="text-right">{project.budget}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Budget</TableCell>
          <TableCell className="text-right">$39,550</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
})

export const Card = meta.story({
  render: () => (
    <Table className="w-full" variant="card">
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.name}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
                />
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.team}</TableCell>
            <TableCell className="text-right">{project.budget}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Budget</TableCell>
          <TableCell className="text-right">$39,550</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
})

export const SelectedRow = meta.story({
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project, idx) => (
          <TableRow data-state={idx === 1 ? "selected" : undefined} key={project.name}>
            <TableCell className="font-medium">{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${STATUS_DOT[project.status]}`}
                />
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.team}</TableCell>
            <TableCell className="text-right">{project.budget}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
})
