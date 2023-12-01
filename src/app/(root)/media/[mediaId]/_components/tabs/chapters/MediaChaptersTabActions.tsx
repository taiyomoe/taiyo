import { useState } from "react";
import { Button } from "@nextui-org/button";

type Props = {
  volumeKeys: string[];
  setSelectedKeys: (keys: Set<string>) => void;
};

export const MediaChaptersTabActions = ({
  volumeKeys,
  setSelectedKeys,
}: Props) => {
  const [expanded, setExpanded] = useState(true);

  const collapseAll = () => {
    setSelectedKeys(new Set());
  };
  const expandVolumes = () => {
    setSelectedKeys(new Set(volumeKeys));
  };

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
        className="w-[70px]"
        onPress={handleExpandedButtonPress}
        isDisabled={volumeKeys.length === 0}
        size="sm"
      >
        {expanded ? "Recolher" : "Expandir"}
      </Button>
    </div>
  );
};
