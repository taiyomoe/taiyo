import { useMemo, useState } from "react";
import { Card, CardBody } from "@nextui-org/card";
import type { Selection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";

import type { MediaWithRelations } from "~/lib/types";
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils";
import { SelectUtils } from "~/lib/utils/select.utils";
import { useMediaUpdateStore } from "~/stores";

import { UpdateMediaCoverForm } from "./UpdateMediaCoverForm";

type Props = {
  media: MediaWithRelations;
};

export const UpdateMediaCoversShowcase = ({ media }: Props) => {
  const { covers } = useMediaUpdateStore();
  const volumes = useMemo(
    () => MediaCoverUtils.computeVolumes(covers),
    [covers],
  );

  const lowestVolumeNumber = MediaCoverUtils.getLowestVolumeNumber({ media });
  const [values, setValues] = useState<Selection>(
    new Set([lowestVolumeNumber?.toString() ?? ""]),
  );

  const currentVolume = useMemo(() => {
    if (!volumes.length) return;

    const selectedVolumeNum = Number(SelectUtils.getSelectedKey(values));
    const selectedVolume = volumes.find((v) => v.number === selectedVolumeNum);

    if (selectedVolume) return selectedVolume;

    const lowestVolumeNum = MediaCoverUtils.getLowestVolumeNumber({ volumes });
    setValues(new Set([lowestVolumeNum?.toString() ?? ""]));

    return volumes.find((v) => v.number === lowestVolumeNum);
  }, [values, volumes]);

  if (lowestVolumeNumber === undefined || !currentVolume) {
    return <div>no covers</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h3 className="line-clamp-1 text-2xl font-medium">Covers por volume</h3>
        <div className="flex gap-2">
          <Select
            classNames={{
              base: "w-1/2 md:w-[150px]",
              trigger: "h-[40px]",
            }}
            selectionMode="single"
            selectedKeys={values}
            onSelectionChange={setValues}
            aria-label="Select cover volume"
          >
            {volumes.map((v) => (
              <SelectItem
                key={v.number}
                value={v.number.toString()}
                textValue={`Volume ${v.number}`}
              >
                <p>Volume {v.number}</p>
              </SelectItem>
            ))}
          </Select>
          <Select
            classNames={{
              base: "w-1/2 md:w-[200px]",
              trigger: "h-[40px]",
            }}
            selectionMode="multiple"
            selectedKeys={new Set(["en"])}
            onSelectionChange={setValues}
            aria-label="Select cover languages"
            isDisabled
          >
            <SelectItem key="en" value="en" textValue="Inglês">
              Inglês
            </SelectItem>
          </Select>
        </div>
      </div>
      <Card>
        <CardBody className="flex flex-row gap-4 overflow-x-auto scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary">
          {currentVolume.covers.map((c) => (
            <UpdateMediaCoverForm key={c.id} media={media} cover={c} />
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
