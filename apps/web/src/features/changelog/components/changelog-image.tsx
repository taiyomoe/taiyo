import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
  figure: {
    margin: 0,
    marginTop: "3rem",
  },
  image: {
    borderRadius: "0.5rem",
    display: "block",
    height: "auto",
    width: "100%",
  },
})

export const ChangelogImage = ({
  src,
  alt,
  width,
  height,
}: {
  src: string
  alt: string
  width: number
  height: number
}) => (
  <figure sx={styles.figure}>
    <img alt={alt} decoding="async" height={height} src={src} sx={styles.image} width={width} />
  </figure>
)
