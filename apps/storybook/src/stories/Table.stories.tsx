import * as stylex from "@stylexjs/stylex"
import { colors, radius } from "@taiyomoe/ui/styles/tokens.stylex"
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

// The dot that precedes a status in its badge. Semantic colours come from the
// design tokens; "Unpaid" is deliberately neutral rather than a fifth hue.
const dot = stylex.create({
  base: {
    borderRadius: radius.full,
    height: "0.375rem",
    width: "0.375rem",
  },
  Paid: { backgroundColor: colors.success },
  Unpaid: { backgroundColor: `color-mix(in srgb, ${colors.mutedForeground} 64%, transparent)` },
  Pending: { backgroundColor: colors.warning },
  Failed: { backgroundColor: colors.destructive },
})
const projects: Project[] = [
  { name: "Website Redesign", status: "Paid", team: "Frontend Team", budget: "$12,500" },
  { name: "Mobile App", status: "Unpaid", team: "Mobile Team", budget: "$8,750" },
  { name: "API Integration", status: "Pending", team: "Backend Team", budget: "$5,200" },
  { name: "Database Migration", status: "Paid", team: "DevOps Team", budget: "$3,800" },
  { name: "User Dashboard", status: "Paid", team: "UX Team", budget: "$7,200" },
  { name: "Security Audit", status: "Failed", team: "Security Team", budget: "$2,100" },
]
const styles = stylex.create({
  numeric: {
    textAlign: "right",
  },
  label: {
    fontWeight: 500,
  },
  anchor: {
    width: "100%",
  },
})
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
          <TableHead sx={styles.numeric}>Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.name}>
            <TableCell sx={styles.label}>{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                <span aria-hidden="true" sx={[dot.base, dot[project.status]]} />
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.team}</TableCell>
            <TableCell sx={styles.numeric}>{project.budget}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Budget</TableCell>
          <TableCell sx={styles.numeric}>$39,550</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
})

export const Card = meta.story({
  render: () => (
    <Table sx={styles.anchor} variant="card">
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Team</TableHead>
          <TableHead sx={styles.numeric}>Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.name}>
            <TableCell sx={styles.label}>{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                <span aria-hidden="true" sx={[dot.base, dot[project.status]]} />
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.team}</TableCell>
            <TableCell sx={styles.numeric}>{project.budget}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total Budget</TableCell>
          <TableCell sx={styles.numeric}>$39,550</TableCell>
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
          <TableHead sx={styles.numeric}>Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project, idx) => (
          <TableRow data-state={idx === 1 ? "selected" : undefined} key={project.name}>
            <TableCell sx={styles.label}>{project.name}</TableCell>
            <TableCell>
              <Badge variant="outline">
                <span aria-hidden="true" sx={[dot.base, dot[project.status]]} />
                {project.status}
              </Badge>
            </TableCell>
            <TableCell>{project.team}</TableCell>
            <TableCell sx={styles.numeric}>{project.budget}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
})
