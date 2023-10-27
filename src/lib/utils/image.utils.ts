import Resizer from "react-image-file-resizer";

const compress = (file: File): Promise<File> =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      Infinity,
      Infinity,
      "JPEG",
      85,
      0,
      (uri) => {
        resolve(uri as File);
      },
      "file",
    );
  });

export const ImageUtils = {
  compress,
};
