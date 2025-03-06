import { type VariantProps, tv } from "@heroui/react"
import {
  CheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  DownloadCloudIcon,
  UploadCloudIcon,
} from "lucide-react"

const tableCellTaskStatus = tv({
  base: "",
  variants: {
    status: {
      PENDING: "text-default-400",
      DOWNLOADING: "text-warning",
      UPLOADING: "text-warning",
      FINISHED: "text-success",
      FAILED: "text-danger",
    },
  },
})

type Props = VariantProps<typeof tableCellTaskStatus>

export const TableCellTaskStatus = ({ status }: Props) => {
  const classes = tableCellTaskStatus({ status })

  switch (status) {
    case "PENDING":
      return <CircleDashedIcon className={classes} />
    case "DOWNLOADING":
      return <DownloadCloudIcon className={classes} />
    case "UPLOADING":
      return <UploadCloudIcon className={classes} />
    case "FINISHED":
      return <CheckIcon className={classes} />
    case "FAILED":
      return <CircleXIcon className={classes} />
    default:
      return <CircleDashedIcon className={classes} />
  }
}
