import { Category } from "~/components/generics/Category";
import type { MediaLimited } from "~/lib/types";

type Props = {
  media: MediaLimited;
};

export const MediaInfoTabGenres = ({ media }: Props) => (
  <div className="items-start">
    {media.genres.length > 0 && (
      <Category title="Gêneros">
        <div className="flex flex-wrap gap-2">
          {media.genres.map((item) => (
            <div
              key={item}
              className="flex select-none gap-1 rounded-md bg-default-200 px-2 py-1.5 text-sm text-foreground"
            >
              <p>{item}</p>
            </div>
          ))}
        </div>
      </Category>
    )}
  </div>
);
