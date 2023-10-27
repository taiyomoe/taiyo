const convert = async (source: File) => {
  const image = await createImageBitmap(source);

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);

  const result: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob != null) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert file"));
        }
      },
      "image/jpeg",
      0.85,
    );
  });

  image.close();

  return new File([result], source.name, {
    lastModified: Date.now(),
    type: "image/jpeg",
  });
};

export const ImageUtils = {
  convert,
};
