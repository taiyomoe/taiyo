import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal"
import type { ChaptersListItem } from "@taiyomoe/types"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { api } from "~/trpc/react"

type Props = {
  isOpen: boolean
  onOpenChange: () => void
}

export const ChaptersTableDeleteModal = ({ isOpen, onOpenChange }: Props) => {
  const table = useDataTable<ChaptersListItem>()
  const [isDisabled, setIsDisabled] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const { mutateAsync } = api.chapters.bulkDelete.useMutation()
  const selectedChapters = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const chaptersCount = selectedChapters.length
  const dynamicTextSolo = useMemo(
    () => (chaptersCount === 1 ? "capítulo" : "capítulos"),
    [chaptersCount],
  )
  const dynamicTextAs = useMemo(
    () => (chaptersCount === 1 ? "o capítulo" : "os capítulos"),
    [chaptersCount],
  )
  const utils = api.useUtils()

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    setIsDisabled(newValue.toLowerCase() !== `apagar ${dynamicTextAs}`)
  }

  const handleDelete = () => {
    const ids = selectedChapters.map((s) => s.id)

    setIsDisabled(true)

    toast.promise(mutateAsync(ids), {
      loading: `Apagando ${dynamicTextAs}...`,
      success: () => {
        table.resetRowSelection()
        utils.chapters.getList.invalidate()
        onOpenChange()
        setInputValue("")

        return `${chaptersCount === 1 ? "Capítulo apagado" : "Capítulos apagados"} com sucesso!`
      },
      error: `Ocorreu um erro inesperado ao apagar ${dynamicTextAs}.`,
    })
  }

  // This is the ugliest shit ever. I'm sorry but I have to move fast...
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          Apagar {chaptersCount} {dynamicTextSolo}
        </ModalHeader>
        <ModalBody className="gap-6">
          <p>
            Você está prestes a apagar {chaptersCount} {dynamicTextSolo}. Tem
            certeza?
          </p>
          <div className="rounded-md border border-warning-200 bg-warning-100 p-2">
            {chaptersCount === 1
              ? "O capítulo poderá ser restaurado."
              : "Os capítulos poderão ser restaurados."}
          </div>
          <div className="flex flex-col gap-2">
            <p>
              Para confirmar que é o que você quer, digite "
              <span className="text-warning-400">apagar {dynamicTextAs}</span>"
              no campo abaixo.
            </p>
            <Input
              value={inputValue}
              placeholder={`Digite "apagar ${dynamicTextAs}" para confirmar`}
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
            color="danger"
            variant="flat"
            onPress={handleDelete}
            isDisabled={isDisabled}
          >
            Apagar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
