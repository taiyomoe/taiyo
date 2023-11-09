type Props = {
  url: string;
  hide: boolean;
};

export const DisplayMediaChapterImage = ({ url, hide }: Props) => (
  <img
    src={url}
    style={{
      display: hide ? "none" : "block",
      objectFit: "contain",
      height: "100%",
      width: "100%",
    }}
    alt="image"
  />
);
