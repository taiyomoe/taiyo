"use client"

import { Card, CardBody } from "@nextui-org/card"
import { type DropzoneProps, useDropzone } from "react-dropzone"
import { AssetSelection } from "~/components/ui/upload/asset-selection"
import { cn } from "~/lib/utils/cn"

type Props = DropzoneProps & {
  isSelected?: boolean
  className?: string
}

export const FolderSelection = ({ isSelected, className, ...props }: Props) => {
  const { getRootProps, getInputProps } = useDropzone({
    ...props,
    disabled: isSelected,
  })

  return (
    <Card
      className={cn(
        "rounded-medium outline-none transition-[background,transform] hover:cursor-pointer hover:bg-content2 active:scale-[0.99]",
        className,
      )}
      data-selected={isSelected}
    >
      <CardBody as="section" {...getRootProps()} className="outline-none">
        <input
          {...getInputProps()}
          /* @ts-expect-error - react typigns error*/
          webkitdirectory=""
          directory
        />
        <AssetSelection type="folder" />
      </CardBody>
    </Card>
  )
}
