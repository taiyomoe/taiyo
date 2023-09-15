import type { MediaTitles } from "@taiyo/db/schema/mediaTitles";

type Props = {
  titles: MediaTitles | undefined;
};

export const TitlesShowcase = ({ titles }: Props) => {
  return (
    <div>
      <h1>Media Titles</h1>
      <ul>
        {titles?.map((item, index) => (
          <li key={index}>
            {item.title} | {item.language} |{" "}
            {item.isAcronym ? "Acronym" : "Not Acronym"}
          </li>
        ))}
      </ul>
    </div>
  );
};
