import { Button } from "@nextui-org/button";
import { HardDriveDownloadIcon } from "lucide-react";

import { Form } from "~/components/generics/form/Form";
import { InputFormField } from "~/components/generics/form/InputFormField";

export const MediaTrackersFormCategory = () => {
  return (
    <Form.Category title="Trackers">
      <Form.Row>
        <InputFormField
          name="mdTracker"
          label="ID na MangaDex"
          labelPlacement="outside"
          placeholder="a1c7c817-4e59-43b7-9365-09675a149a6f"
          className="md:w-2/3"
          classNames={{ inputWrapper: "pr-0" }}
          endContent={
            <Button
              className="rounded-l-none"
              color="primary"
              startContent={<HardDriveDownloadIcon size={20} />}
              isIconOnly
              isDisabled
            />
          }
        />
        <InputFormField
          name="alTracker"
          label="ID na AniList"
          labelPlacement="outside"
          placeholder="30013"
          className="md:w-fit"
        />
        <InputFormField
          name="malTracker"
          label="ID no MyAnimeList"
          labelPlacement="outside"
          placeholder="13"
          className="md:w-fit"
        />
      </Form.Row>
    </Form.Category>
  );
};
