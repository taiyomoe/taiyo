import { type VariantProps, tv } from "@nextui-org/react"
import {
  CheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  DownloadCloudIcon,
  UploadCloudIcon,
} from "lucide-react"

const tableCellStatus = tv({
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

type Props = VariantProps<typeof tableCellStatus>

export const TableCellStatus = ({ status }: Props) => {
  const classes = tableCellStatus({ status })

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
