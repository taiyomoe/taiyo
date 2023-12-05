import type { MediaWithRelations } from "~/lib/types";

type Props = {
  media: MediaWithRelations;
};

export const EditMediaCoversTab = ({ media }: Props) => {
  return <div>{JSON.stringify(media.covers)}</div>;
};
