import { Button } from "@nextui-org/button";
import { useField } from "formik";
import { PlusIcon, TrashIcon } from "lucide-react";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";
import { SwitchFormField } from "~/components/generics/form/SwitchFormField";
import { type InsertMediaSchema } from "~/lib/schemas";

export const MediaTitlesFormCategory = () => {
  const [{ value }, {}, { setValue }] = useField<InsertMediaSchema["titles"]>({
    name: "titles",
  });

  const handleAddTitle = async () => {
    await setValue([
      ...value,
      { title: "", isAcronym: false, language: "ENGLISH" },
    ]);
  };

  const handleRemoveTitle = async (index: number) => {
    const newTitles = [...value];
    newTitles.splice(index, 1);
    await setValue(newTitles, false);
  };

  const categoryActions = (
    <>
      <p className="text-xs font-semibold uppercase">ACRÔNIMO</p>
      <Button
        startContent={<PlusIcon size={20} />}
        onPress={handleAddTitle}
        color="primary"
        size="sm"
        isIconOnly
      />
    </>
  );

  return (
    <Form.Category title="Títulos" actions={categoryActions}>
      {value.map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <InputFormField name={`titles[${index}].title`} />
          <SwitchFormField name={`titles[${index}].isAcronym`} size="lg" />
          <Button
            onPress={() => void handleRemoveTitle(index)}
            startContent={<TrashIcon size={20} />}
            isDisabled={value.length === 1}
            color="danger"
            size="sm"
            isIconOnly
          />
        </div>
      ))}
    </Form.Category>
  );
};
