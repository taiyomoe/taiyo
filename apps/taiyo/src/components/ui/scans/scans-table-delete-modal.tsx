import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal"
import type { ScansListItem } from "@taiyomoe/types"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { useDataTable } from "~/components/generics/data-table/data-table-context"
import { api } from "~/trpc/react"

type Props = {
  isOpen: boolean
  onOpenChange: () => void
}

export const ScansTableDeleteModal = ({ isOpen, onOpenChange }: Props) => {
  const table = useDataTable<ScansListItem>()
  const [isDisabled, setIsDisabled] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const { mutateAsync } = api.scans.bulkMutate.useMutation()
  const selectedScans = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const scansCount = selectedScans.length
  const dynamicTextSolo = useMemo(
    () => (scansCount === 1 ? "scan" : "scans"),
    [scansCount],
  )
  const dynamicTextAs = useMemo(
    () => (scansCount === 1 ? "a scan" : "as scans"),
    [scansCount],
  )
  const utils = api.useUtils()

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    setIsDisabled(newValue.toLowerCase() !== `apagar ${dynamicTextAs}`)
  }

  const handleDelete = () => {
    const ids = selectedScans.map((s) => s.id)

    setIsDisabled(true)

    toast.promise(mutateAsync({ type: "delete", ids }), {
      loading: `Apagando ${dynamicTextAs}...`,
      success: () => {
        table.resetRowSelection()
        utils.scans.getList.invalidate()
        onOpenChange()
        setInputValue("")

        return `${scansCount === 1 ? "Scan apagada" : "Scans apagadas"} com sucesso!`
      },
      error: `Ocorreu um erro inesperado ao apagar ${dynamicTextAs}.`,
    })
  }

  // This is the ugliest shit ever. I'm sorry but I have to move fast...
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          Apagar {scansCount} {dynamicTextSolo}
        </ModalHeader>
        <ModalBody className="gap-6">
          <p>
            Você está prestes a apagar {scansCount} {dynamicTextSolo}. Tem
            certeza?
          </p>
          <div className="rounded-md border border-warning-200 bg-warning-100 p-2">
            {scansCount === 1
              ? "A scan poderá ser restaurada."
              : "As scans poderão ser restauradas."}
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
