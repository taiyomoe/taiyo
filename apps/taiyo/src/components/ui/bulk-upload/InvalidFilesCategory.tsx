import { AlertTriangleIcon } from "lucide-react"
import type { InvalidFile } from "~/lib/types"

type Props = {
  title: string
  files: InvalidFile[]
}

export const InvalidFilesCategory = ({ title, files }: Props) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <AlertTriangleIcon className="text-warning" size={20} />
      <h3 className="font-medium">{title}</h3>
    </div>
    <div className="scrollbar-thin scrollbar-track-content2 flex flex-col overflow-x-auto">
      {files.map((file) => (
        <p key={file.path} className="text-nowrap text-default-500 text-sm">
          {file.path}
        </p>
      ))}
    </div>
  </div>
)
