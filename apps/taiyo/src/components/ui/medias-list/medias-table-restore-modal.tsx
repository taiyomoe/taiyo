import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal"
import type { MediasListItem } from "@taiyomoe/types"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { api } from "~/trpc/react"

type Props = {
  isOpen: boolean
  onOpenChange: () => void
}

export const MediasTableRestoreModal = ({ isOpen, onOpenChange }: Props) => {
  const table = useDataTable<MediasListItem>()
  const [isDisabled, setIsDisabled] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const { mutateAsync } = api.medias.bulkMutate.useMutation()
  const selectedMedias = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const mediasCount = selectedMedias.length
  const dynamicTextSolo = useMemo(
    () => (mediasCount === 1 ? "obra" : "obras"),
    [mediasCount],
  )
  const dynamicTextAs = useMemo(
    () => (mediasCount === 1 ? "a obra" : "as obras"),
    [mediasCount],
  )
  const utils = api.useUtils()

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    setIsDisabled(newValue.toLowerCase() !== `restaurar ${dynamicTextAs}`)
  }

  const handleRestore = () => {
    const ids = selectedMedias.map((s) => s.id)

    setIsDisabled(true)

    toast.promise(mutateAsync({ type: "restore", ids }), {
      loading: `Restaurando ${dynamicTextAs}...`,
      success: () => {
        table.resetRowSelection()
        utils.medias.getList.invalidate()
        onOpenChange()
        setInputValue("")

        return `${mediasCount === 1 ? "Obra restaurada" : "Obras restauradas"} com sucesso!`
      },
      error: `Ocorreu um erro inesperado ao restaurar ${dynamicTextAs}.`,
    })
  }

  // This is the ugliest shit ever. I'm sorry but I have to move fast...
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          Restaurar {mediasCount} {dynamicTextSolo}
        </ModalHeader>
        <ModalBody className="gap-6">
          <p>
            Você está prestes a restaurar {mediasCount} {dynamicTextSolo}. Tem
            certeza?
          </p>
          <div className="flex flex-col gap-2">
            <p>
              Para confirmar que é o que você quer, digite "
              <span className="text-warning-400">
                restaurar {dynamicTextAs}
              </span>
              " no campo abaixo.
            </p>
            <Input
              value={inputValue}
              placeholder={`Digite "restaurar ${dynamicTextAs}" para confirmar`}
              onValueChange={handleChange}
              autoFocus
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onOpenChange}>
            Cancelar
          </Button>
          <Button
            color="warning"
            variant="flat"
            onPress={handleRestore}
            isDisabled={isDisabled}
          >
            Restaurar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
