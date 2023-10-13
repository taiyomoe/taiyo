import { useState } from "react";
import { Button } from "@nextui-org/button";
import { PencilIcon } from "lucide-react";

type Props = {
  collapseAll: () => void;
  expandVolumes: () => void;
};

export const MediaChaptersTabActions = ({
  collapseAll,
  expandVolumes,
}: Props) => {
  const [expanded, setExpanded] = useState(true);

  const handleExpandedButtonPress = () => {
    if (expanded) {
      collapseAll();
      setExpanded(false);
    } else {
      expandVolumes();
      setExpanded(true);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        startContent={<PencilIcon size={16} />}
        size="sm"
        isIconOnly
        isDisabled
      />
      <Button
        className="w-[70px]"
        onPress={handleExpandedButtonPress}
        size="sm"
      >
        {expanded ? "Recolher" : "Expandir"}
      </Button>
    </div>
  );
};
