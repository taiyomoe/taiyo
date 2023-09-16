import type { MediaWithRelations } from "@taiyo/db";

import { TabsContent } from "~/components/ui/Tabs";

type Props = { media: MediaWithRelations | undefined };

export const MediaLayoutChaptersTab = ({ media }: Props) => {
  return (
    <TabsContent value="chapters">
      <div>azerty</div>
    </TabsContent>
  );
};
