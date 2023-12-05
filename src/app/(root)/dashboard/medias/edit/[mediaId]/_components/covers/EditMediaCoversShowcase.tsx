import { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardBody } from "@nextui-org/card";
import type { Selection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/select";

import { EditMediaCover } from "~/app/(root)/dashboard/medias/edit/[mediaId]/_components/covers/EditMediaCover";
import type { MediaWithRelations } from "~/lib/types";
import { MediaCoverUtils } from "~/lib/utils/mediaCover.utils";
import { SelectUtils } from "~/lib/utils/select.utils";

type Props = {
  media: MediaWithRelations;
};

export const EditMediaCoversShowcase = ({ media }: Props) => {
  const lowestVolume = MediaCoverUtils.getLowestVolume(media);
  const volumes = MediaCoverUtils.getVolumes(media);
  const [values, setValues] = useState<Selection>(
    new Set([lowestVolume?.toString() ?? ""]),
  );
  const currentVolume = useMemo(() => {
    return volumes.find(
      (v) => v.number === Number(SelectUtils.getSelectedKey(values)),
    );
  }, [values, volumes]);

  if (lowestVolume === undefined || !currentVolume) return <div>no covers</div>;

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
        <CardBody className="flex flex-row gap-4 overflow-x-scroll scrollbar-thin scrollbar-track-content1 scrollbar-thumb-primary">
          {currentVolume.covers.map((c) => (
            <EditMediaCover key={c.id} media={media} cover={c} />
          ))}
          {currentVolume.covers.map((c) => (
            <Image
              key={c.id}
              src={MediaCoverUtils.getUrl({ id: media.id, coverId: c.id })}
              alt="cover"
              className="rounded-small object-cover"
              width={210}
              height={300}
            />
          ))}
        </CardBody>
      </Card>
    </div>
  );
};
