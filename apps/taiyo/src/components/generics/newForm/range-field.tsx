import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import type { SelectableProps } from "react-selectable-box"
import { RangeSelectionCanvas } from "~/components/generics/range/range-selection-canvas"
import { cn } from "~/lib/utils/cn"
import { NumberUtils } from "~/lib/utils/number.utils"

type Props = {
  name: string
  className?: string
  matcher: (value: number) => string | undefined
  availableNumbers: number[]
}

export const RangeField = ({ name, className, matcher, ...rest }: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { setValue: setFieldValue } = useFormContext()
  const [value, setValue] = useState<number[]>([])
  const buttonText = useMemo(() => {
    if (value.length === 0) return "Selecionar"

    return `Range selecionada: ${NumberUtils.compressRange(value)}`
  }, [value])

  const handleSelection: SelectableProps<number>["onEnd"] = (
    _,
    { added, removed },
  ) => {
    const result = value.concat(added).filter((i) => !removed.includes(i))
    setValue(result)

    const matches = result.map(matcher).filter(Boolean)
    setFieldValue(name, matches, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <>
      <Button className={cn("w-full", className)} onPress={onOpen}>
        {buttonText}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          <ModalHeader>Selecionar uma range</ModalHeader>
          <ModalBody>
            <RangeSelectionCanvas
              onEnd={handleSelection}
              value={value}
              disabledNumbers={[]}
              {...rest}
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={onOpenChange}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
