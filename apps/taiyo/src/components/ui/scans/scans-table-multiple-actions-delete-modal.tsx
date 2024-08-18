import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/modal"
import { Input } from "@nextui-org/react"
import { useAtom } from "jotai"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { scansListSelectedKeysAtom } from "~/atoms/scansList.atoms"
import { useScansList } from "~/hooks/useScansList"
import { api } from "~/trpc/react"

type Props = {
  isOpen: boolean
  onOpenChange: () => void
}

export const ScansTableMultipleActionsDeleteModal = ({
  isOpen,
  onOpenChange,
}: Props) => {
  const { items, handleForceRefetch } = useScansList()
  const [isDisabled, setIsDisabled] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [selectedKeys, setSelectedKeys] = useAtom(scansListSelectedKeysAtom)
  const selectedKeysCount = Array.from(selectedKeys).length
  const selectedScans = useMemo(
    () => items.filter((item) => Array.from(selectedKeys).includes(item.id)),
    [selectedKeys, items],
  )
  const affectedChaptersCount = useMemo(
    () => selectedScans.reduce((acc, s) => acc + s.chapters, 0),
    [selectedScans],
  )
  const { mutateAsync } = api.scans.bulkDelete.useMutation()

  const handleChange = (newValue: string) => {
    setInputValue(newValue)
    setIsDisabled(newValue.toLowerCase() !== "apagar as scans")
  }

  const handleDelete = () => {
    const ids = selectedScans.map((s) => s.id)

    setIsDisabled(true)

    toast.promise(mutateAsync({ ids }), {
      loading: "Apagando as scans...",
      success: () => {
        setSelectedKeys(new Set())
        handleForceRefetch()
        onOpenChange()

        return "Scans apagadas com sucesso!"
      },
      error: "Ocorreu um erro inesperado ao apagar as scans.",
    })
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Apagar {selectedKeysCount} scans</ModalHeader>
        <ModalBody className="gap-6">
          <p>
            Você está prestes a apagar {selectedKeysCount} scans e a dissociar{" "}
            {affectedChaptersCount} capítulos (cumulados) destas scans. Tem
            certeza?
          </p>
          <div className="rounded-md border border-warning-200 bg-warning-100 p-2">
            As scans não serão totalmente excluídas, elas podem ser restauradas
            no futuro. No entanto, esse sistema ainda não está completo e por
            tanto é impossível restaurá-las no momento.
          </div>
          <div className="flex flex-col gap-2">
            <p>
              Para confirmar que é o que você quer, digite "
              <span className="text-warning-400">apagar as scans</span>" no
              campo abaixo.
            </p>
            <Input
              value={inputValue}
              placeholder={`Digite "apagar as scans" para confirmar`}
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
