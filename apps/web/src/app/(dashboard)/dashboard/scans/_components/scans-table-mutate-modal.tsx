import { Button } from "@heroui/button"
import { Input } from "@heroui/input"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal"
import type { ScansListItem } from "@taiyomoe/types"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { api } from "~/trpc/react"

type Props = {
  type: "delete" | "restore"
  isOpen: boolean
  onOpenChange: () => void
}

export const ScansTableMutateModal = ({
  type,
  isOpen,
  onOpenChange,
}: Props) => {
  const table = useDataTable<ScansListItem>()
  const [isDisabled, setIsDisabled] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const { mutateAsync } = api.scans.bulkMutate.useMutation()
  const globalT = useTranslations("global")
  const t = useTranslations("dashboard.scans.list")
  const selectedScans = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const defaultI18nArgs = { type, count: selectedScans.length }
  const utils = api.useUtils()

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    setIsDisabled(
      newValue.toLowerCase() !== t("mutate.confirmationText", defaultI18nArgs),
    )
  }

  const handleDelete = () => {
    const ids = selectedScans.map((s) => s.id)

    setIsDisabled(true)

    toast.promise(mutateAsync({ type, ids }), {
      loading: t("mutate.loading", defaultI18nArgs),
      success: () => {
        table.resetRowSelection()
        utils.scans.getList.invalidate()
        onOpenChange()
        setInputValue("")

        return t("mutate.success", defaultI18nArgs)
      },
      error: t("mutate.error", defaultI18nArgs),
    })
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>{t("mutate.title", defaultI18nArgs)}</ModalHeader>
        <ModalBody className="gap-6">
          <p>{t("mutate.description", defaultI18nArgs)}</p>
          <div
            className="hidden rounded-md border border-warning-200 bg-warning-100 p-2 data-[type=delete]:block"
            data-type={type}
          >
            {t("mutate.deleteWarning", defaultI18nArgs)}
          </div>
          <div className="flex flex-col gap-2">
            <p>
              {t.rich("mutate.confirmationDescription", {
                confirmationText: () => (
                  <span>{t("mutate.confirmationText", defaultI18nArgs)}</span>
                ),
              })}
            </p>
            <Input
              value={inputValue}
              placeholder={t
                .rich("mutate.confirmationPlaceholder", {
                  confirmationText: () =>
                    t("mutate.confirmationText", defaultI18nArgs),
                })
                ?.toString()}
              onValueChange={handleChange}
              autoFocus
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onOpenChange}>
            {globalT("cancel")}
          </Button>
          <Button
            color="danger"
            variant="flat"
            onPress={handleDelete}
            isDisabled={isDisabled}
          >
            {t("mutate.action", defaultI18nArgs)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
