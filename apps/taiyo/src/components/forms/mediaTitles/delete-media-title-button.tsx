import { Button } from "@nextui-org/react"
import type { UpdateMediaTitleInput } from "@taiyomoe/schemas"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"

type Props = {
  toggleModal: () => void
}

export const DeleteMediaTitleButton = ({ toggleModal }: Props) => {
  const {
    getValues,
    formState: { defaultValues },
  } = useFormContext<UpdateMediaTitleInput>()
  const { del } = useMediaUpdateStore()
  const { mutateAsync } = api.mediaTitles.delete.useMutation()

  const handlePress = () => {
    const id = getValues("id")

    toast.promise(mutateAsync({ id }), {
      loading: "Apagando o título...",
      success: () => {
        del("title", id)
        toggleModal()

        return "Título apagado com sucesso!"
      },
      error: "Erro ao apagar o título.",
    })
  }

  return (
    <Button
      onPress={handlePress}
      isDisabled={defaultValues?.isMainTitle}
      variant="light"
      color="danger"
    >
      Apagar
    </Button>
  )
}
