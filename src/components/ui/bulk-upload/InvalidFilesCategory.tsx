import { AlertTriangleIcon } from "lucide-react"
import { InvalidFile } from "~/lib/types"

type Props = {
  title: string
  files: InvalidFile[]
}

export const InvalidFilesCategory = ({ title, files }: Props) => (
  <div className="flex gap-2 flex-col">
    <div className="flex gap-2 items-center">
      <AlertTriangleIcon className="text-warning" size={20} />
      <h3 className="font-medium">{title}</h3>
    </div>
    <div className="flex flex-col overflow-x-auto scrollbar-thin scrollbar-track-content2">
      {files.map((file) => (
        <p key={file.path} className="text-sm text-default-500 text-nowrap">
          {file.path}
        </p>
      ))}
    </div>
  </div>
)
