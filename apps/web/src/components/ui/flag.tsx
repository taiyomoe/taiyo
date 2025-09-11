import type { Languages } from "@prisma/client"
import {
  BR,
  type Props as FlagProps,
  FR,
  US,
} from "country-flag-icons/react/3x2"

type Props = FlagProps & { language: Languages }

export const Flag = ({ language, ...props }: Props) => {
  switch (language) {
    case "en":
      return <US {...props} />
    case "pt_br":
      return <BR {...props} />
    case "fr":
      return <FR {...props} />
  }
}
