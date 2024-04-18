import { Button } from "@nextui-org/button"
import type { UpdateMediaCoverSchema } from "@taiyomoe/schemas"
import { useFormikContext } from "formik"
import { toast } from "sonner"
import { useMediaUpdateStore } from "~/stores"
import { api } from "~/trpc/react"

type Props = {
  toggleModal: () => void
}

export const UpdateMediaCoverDeleteButton = ({ toggleModal }: Props) => {
  const { initialValues, values } = useFormikContext<UpdateMediaCoverSchema>()
  const { del } = useMediaUpdateStore()
  const { mutateAsync } = api.mediaCovers.delete.useMutation()

  const handlePress = () => {
    toast.promise(mutateAsync({ id: values.id }), {
      loading: "Apagando a cover...",
      success: () => {
        del("cover", values.id)
        toggleModal()

        return "Cover apagada com sucesso!"
      },
      error: "Erro ao apagar a cover.",
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
