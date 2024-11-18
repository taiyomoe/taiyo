import { Button } from "@nextui-org/button"
import type { UpdateCoverInput } from "@taiyomoe/schemas"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"

type Props = {
  toggleModal: () => void
}

export const DeleteCoverButton = ({ toggleModal }: Props) => {
  const {
    getValues,
    formState: { defaultValues },
  } = useFormContext<UpdateCoverInput>()
  const { mutateAsync } = api.covers.delete.useMutation()
  const { del } = useMediaUpdateStore()

  const handlePress = () => {
    const id = getValues("id")

    toast.promise(mutateAsync(id), {
      loading: "Apagando a cover...",
      success: () => {
        del("cover", id)
        toggleModal()

        return "Cover apagada com sucesso!"
      },
      error: "Erro ao apagar a cover.",
    })
  }

  return (
    <Button
      onPress={handlePress}
      isDisabled={defaultValues?.isMainCover}
      variant="light"
      color="danger"
    >
      Apagar
    </Button>
  )
}
