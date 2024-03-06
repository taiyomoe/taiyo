import { Button } from "@nextui-org/react"
import type { UpdateMediaCoverSchema } from "@taiyomoe/schemas"
import { useFormikContext } from "formik"
import { toast } from "sonner"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"

type Props = {
  toggleModal: () => void
}

export const UpdateMediaTitleDeleteButton = ({ toggleModal }: Props) => {
  const { initialValues, values } = useFormikContext<UpdateMediaCoverSchema>()
  const { del } = useMediaUpdateStore()
  const { mutateAsync } = api.mediaTitles.delete.useMutation()

  const handlePress = () => {
    toast.promise(mutateAsync({ id: values.id }), {
      loading: "Apagando o título...",
      success: () => {
        del("title", values.id)
        toggleModal()

        return "Título apagado com sucesso!"
      },
      error: "Erro ao apagar o título.",
    })
  }

  return (
    <Button
      onPress={handlePress}
      isDisabled={initialValues.isMainCover}
      variant="light"
      color="danger"
    >
      Apagar
    </Button>
  )
}
