import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal"
import { Input } from "@nextui-org/react"
import type { ScansListItem } from "@taiyomoe/types"
import { useSetAtom } from "jotai"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { scansListSelectedKeysAtom } from "~/atoms/scansList.atoms"
import { useScansList } from "~/hooks/useScansList"
import { api } from "~/trpc/react"

type Props = {
  selectedScans: ScansListItem[]
  isOpen: boolean
  onOpenChange: () => void
}

export const ScansTableDeleteModal = ({
  selectedScans,
  isOpen,
  onOpenChange,
}: Props) => {
  const { handleForceRefetch } = useScansList()
  const [isDisabled, setIsDisabled] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const setSelectedKeys = useSetAtom(scansListSelectedKeysAtom)
  const scansCount = selectedScans.length
  const affectedChaptersCount = useMemo(
    () => selectedScans.reduce((acc, s) => acc + s.chapters, 0),
    [selectedScans],
  )
  const { mutateAsync } = api.scans.bulkDelete.useMutation()
  const dynamicTextSolo = useMemo(
    () => (scansCount === 1 ? "scan" : "scans"),
    [scansCount],
  )
  const dynamicTextAs = useMemo(
    () => (scansCount === 1 ? "a scan" : "as scans"),
    [scansCount],
  )

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    setIsDisabled(newValue.toLowerCase() !== `apagar ${dynamicTextAs}`)
  }

  const handleDelete = () => {
    const ids = selectedScans.map((s) => s.id)

    setIsDisabled(true)

    toast.promise(mutateAsync({ ids }), {
      loading: `Apagando ${dynamicTextAs}...`,
      success: () => {
        setSelectedKeys(new Set())
        handleForceRefetch()
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
            Você está prestes a apagar {scansCount} {dynamicTextSolo} e a
            dissociar {affectedChaptersCount} capítulos (cumulados) dest
            {dynamicTextAs}. Tem certeza?
          </p>
          <div className="rounded-md border border-warning-200 bg-warning-100 p-2">
            {scansCount === 1
              ? "A scan não será totalmente excluída, ela poderá ser restaurada"
              : "As scans não serão totalmente excluídas, elas poderão ser restauradas"}{" "}
            no futuro. No entanto, esse sistema ainda não está completo por
            tanto não é possível restaurá-la
            {scansCount > 1 ? "s" : ""}
            no momento.
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
