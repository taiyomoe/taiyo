import { Button } from "@nextui-org/button"
import { Card, CardBody } from "@nextui-org/card"
import { tv } from "@nextui-org/react"
import { ReactEventHandler, useCallback, useRef, useState } from "react"
import { SubmitButton } from "~/components/generics/buttons/SubmitButton"
import { Form } from "~/components/generics/form/Form"
import { AssetSelection } from "~/components/ui/AssetSelection"
import { InvalidFilesModal } from "~/components/ui/bulk-upload/InvalidFilesModal"
import { ImageFolder, InvalidFile } from "~/lib/types"
import { ImageUtils } from "~/lib/utils/image.utils"
import { useImageFolderStore } from "~/stores"

type Props = {
  title: string
  isCompact?: boolean
  endContent?: React.ReactNode
  children(options: {
    selectedFolders: ImageFolder[]
  }): React.ReactNode
}

const folderDropzone = tv({
  slots: {
    container:
      "w-full rounded-medium border border-dashed border-default-300 bg-default-100 p-3 transition-all !duration-150",
  },
  variants: {
    disabled: {
      false: {
        container: "hover:cursor-pointer hover:bg-default-200",
      },
    },
    compact: {
      true: {
        container:
          "max-h-[498px] overflow-y-auto scrollbar-track-content2 scrollbar-thumb-primary scrollbar-thin",
      },
    },
  },
})

export const FolderDropzone = (props: Props) => {
  const { title, isCompact, endContent, children } = props
  const { folders: selectedFolders, reset, load } = useImageFolderStore()
  const [invalidFiles, setInvalidFiles] = useState<InvalidFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const shouldDisableUploadButton = selectedFolders.length === 0
  const shouldDisableResetButton =
    selectedFolders.length === 0 && invalidFiles.length === 0

  const { container } = folderDropzone({
    disabled: !shouldDisableResetButton,
    compact: selectedFolders.length !== 0 && isCompact,
  })

  const handleReset = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }

    setInvalidFiles([])
    reset()
  }, [reset])

  const handleSelect = useCallback(() => {
    if (inputRef.current === null) return

    inputRef.current?.click()
  }, [])

  const handleChange: ReactEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const inputTarget = e.target as HTMLInputElement

      if (inputTarget.files === null) return

      const { invalidFiles, chapters } = ImageUtils.computeRelativePaths(
        inputTarget.files,
      )

      if (invalidFiles.length) {
        setInvalidFiles(invalidFiles)

        return
      }

      load(chapters)
    },
    [load],
  )

  return (
    <>
      <Form.Category
        title={title}
        actions={
          <Button
            className="font-medium"
            onPress={handleReset}
            isDisabled={shouldDisableResetButton}
            color="primary"
          >
            Resetar
          </Button>
        }
      >
        <input
          className="hidden"
          type="file"
          ref={inputRef}
          onChange={handleChange}
          // @ts-expect-error this is valid
          directory=""
          webkitdirectory=""
          mozdirectory=""
          multiple
          disabled={!shouldDisableResetButton}
        />
        <Card className="h-full rounded-medium">
          <CardBody className="p-0">
            <div className={container()} onClick={handleSelect}>
              {selectedFolders.length > 0 && children({ selectedFolders })}
              {selectedFolders.length === 0 && <AssetSelection type="folder" />}
            </div>
          </CardBody>
        </Card>

        <InvalidFilesModal files={invalidFiles} reset={handleReset} />
      </Form.Category>
      {selectedFolders.length > 0 && endContent}
      <Form.Actions>
        <SubmitButton isDisabled={shouldDisableUploadButton}>Upar</SubmitButton>
      </Form.Actions>
    </>
  )
}
