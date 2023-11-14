import { Category } from "~/components/generics/Category";
import type { MediaLimited } from "~/lib/types";

type Props = {
  media: MediaLimited;
};

export const MediaInfoTabTags = ({ media }: Props) => (
  <div className="items-start">
    {media.genres.length > 0 && (
      <Category title="Tags">
        <div className="flex flex-wrap gap-2">
          {media.tags.map((item) => (
            <div
              key={item.name}
              className="flex select-none gap-1 rounded-md bg-default-200 px-2 py-1.5 text-sm text-foreground"
            >
              <p>
                {item.name} 
              </p>
            </div>
          ))}
        </div>
      </Category>
    )}
  </div>
);
