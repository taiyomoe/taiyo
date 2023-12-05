import type { MediaWithRelations } from "~/lib/types";

type Props = {
  media: MediaWithRelations;
};

export const EditMediaBannersTab = ({ media }: Props) => {
  return <div>{JSON.stringify(media.banners)}</div>;
};
