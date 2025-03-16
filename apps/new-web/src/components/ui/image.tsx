import NextImage, { type ImageProps } from "next/image"

export const Image = (props: ImageProps) => {
  return (
    <div style={{ width: props.width }}>
      <NextImage {...props} />
    </div>
  )
}
