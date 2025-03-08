import NextImage, { type ImageProps } from "next/image"

type Props = ImageProps

export const Image = (props: Props) => {
  return (
    <div style={{ width: props.width }}>
      <NextImage {...props} />
    </div>
  )
}
