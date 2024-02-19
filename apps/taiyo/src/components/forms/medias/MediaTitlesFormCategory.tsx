import { Button } from "@nextui-org/button"
import { Languages } from "@prisma/client"
import { useField } from "formik"
import { PlusIcon, TrashIcon } from "lucide-react"

import type { InsertMediaSchema } from "@taiyomoe/schemas"
import { Form } from "~/components/generics/form/Form"
import { InputFormField } from "~/components/generics/form/InputFormField"
import { SelectFormField } from "~/components/generics/form/SelectFormField"
import { SwitchFormField } from "~/components/generics/form/SwitchFormField"

export const MediaTitlesFormCategory = () => {
  // biome-ignore lint/correctness/noEmptyPattern: we need to destructure the array
  const [{ value }, {}, { setValue }] = useField<InsertMediaSchema["titles"]>({
    name: "titles",
  })

  const handleAddTitle = async () => {
    await setValue([
      ...value,
      {
        title: "",
        language: "en",
        priority: 1,
        isAcronym: false,
        isMainTitle: false,
      },
    ])
  }

  const handleRemoveTitle = async (index: number) => {
    const newTitles = [...value]
    newTitles.splice(index, 1)
    await setValue(newTitles, false)
  }

  const categoryActions = (
    <>
      <p className="text-xs font-semibold uppercase">Prioridade</p>
      <p className="text-xs font-semibold uppercase">Acrônimo</p>
      <p className="text-xs font-semibold uppercase">Título principal</p>
      <Button
        startContent={<PlusIcon size={20} />}
        onPress={handleAddTitle}
        color="primary"
        size="sm"
        isIconOnly
      />
    </>
  )

  return (
    <Form.Category title="Títulos" actions={categoryActions}>
      {value.map((_, i) => (
        <div key={_.title} className="flex items-center gap-2">
          <InputFormField name={`titles[${i}].title`} />
          <SelectFormField
            name={`titles[${i}].language`}
            items={Languages}
            className="md:w-fit md:min-w-[100px]"
            aria-label="Linguagem do título"
          />
          <InputFormField
            name={`titles[${i}].priority`}
            className="md:w-fit md:min-w-[100px]"
            type="number"
          />
          <SwitchFormField name={`titles[${i}].isAcronym`} size="lg" />
          <SwitchFormField name={`titles[${i}].isMainTitle`} size="lg" />
          <Button
            onPress={() => void handleRemoveTitle(i)}
            startContent={<TrashIcon size={20} />}
            isDisabled={value.length === 1}
            color="danger"
            size="sm"
            isIconOnly
          />
        </div>
      ))}
    </Form.Category>
  )
}
