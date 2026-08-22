type StarsProps = {
  count: number
}

export const AuthCitationsRating = ({ count }: StarsProps) => (
  <span className="inline-flex gap-0.75">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill={i < count ? "#FFB820" : "rgba(255,255,255,0.18)"}
        aria-hidden
      >
        <path d="M12 2.6l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.2 20.1l1.3-6.3L2.7 9.2l6.4-.7L12 2.6z" />
      </svg>
    ))}
  </span>
)
