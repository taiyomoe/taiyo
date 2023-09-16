import type { MediaWithRelations } from "@taiyo/db";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import { MediaLayoutChaptersTab } from "./tabs/MediaLayoutChaptersTab";

type Props = {
  media: MediaWithRelations | undefined;
};

export const MediaLayoutTabs = ({ media }: Props) => {
  return (
    <div className="bg-emerald-900 bg-opacity-50">
      <Tabs defaultValue="chapters">
        <div className="h-[54px] xl:h-[48px]">
          <TabsList>
            <TabsTrigger value="chapters">Capítulos</TabsTrigger>
            <TabsTrigger value="characters" disabled>
              Personagens
            </TabsTrigger>
            <TabsTrigger value="relations" disabled>
              Relações
            </TabsTrigger>
          </TabsList>
        </div>
        <MediaLayoutChaptersTab media={media} />
      </Tabs>
    </div>
  );
};
