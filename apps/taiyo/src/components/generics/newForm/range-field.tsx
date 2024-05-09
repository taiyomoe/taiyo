import { Button } from "@nextui-org/button"
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/modal"
import { type ReactNode, useMemo } from "react"
import { useFormContext, useFormState } from "react-hook-form"
import type { SelectableProps } from "react-selectable-box"
import { RangeOverlappingHelper } from "~/components/generics/range/range-overlapping-helper"
import { RangeSelectionCanvas } from "~/components/generics/range/range-selection-canvas"
import type { RangeItem, RangeValue } from "~/lib/types"
import { cn } from "~/lib/utils/cn"
import { NumberUtils } from "~/lib/utils/number.utils"

type Props = {
  name: string
  className?: string
  items: RangeItem[]
  enableOverlap?: boolean
  renderOverlapMessage?: (items: RangeItem[]) => ReactNode
}

export const RangeField = ({
  name,
  className,
  items,
  enableOverlap = true,
  renderOverlapMessage,
}: Props) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { getValues, setValue: setFieldValue } = useFormContext()
  const { errors } = useFormState()
  const value: string[] = getValues(name)
  // @ts-expect-error - This is a weird hack to get the error of the field DYNAMICALLY. Using regular errors doesn't work for some reason
  const hasError = errors.root?.types?.[name] ?? false
  const buttonText = useMemo(() => {
    if (value.length === 0) return "Selecionar"

    const labels = value
      .map((v: unknown) => items.find((i) => i.value === v)?.label)
      .filter(Number.isFinite) as number[]

    return `Range selecionada: ${NumberUtils.compressRange(labels)}`
  }, [value, items])

  const handleSelection: SelectableProps<RangeValue>["onEnd"] = (
    _,
    { added, removed },
  ) => {
    const newValues = value.concat(added).filter((v) => !removed.includes(v))
    setFieldValue(name, newValues, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <>
      <Button
        className={cn("w-full", className)}
        onPress={onOpen}
        variant={hasError ? "flat" : "solid"}
        color={hasError ? "warning" : "default"}
      >
        {buttonText}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          <ModalHeader>Selecionar uma range</ModalHeader>
          <ModalBody>
            {enableOverlap && (
              <RangeOverlappingHelper
                name={name}
                items={items}
                renderMessage={renderOverlapMessage}
              />
            )}
            <RangeSelectionCanvas
              onEnd={handleSelection}
              value={value}
              items={items}
            />
          </ModalBody>
          <ModalFooter>
            <Button onPress={onOpenChange} variant="light">
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
