import { CheckIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

const checkStrength = (pass: string) => {
  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[0-9]/, text: "At least 1 number" },
    { regex: /[a-z]/, text: "At least 1 lowercase letter" },
    { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
  ]

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }))
}

type Props = { value: string }

export const PasswordStrength = ({ value }: Props) => {
  const t = useTranslations("auth")
  const strength = checkStrength(value)
  const strengthScore = useMemo(
    () => strength.filter((req) => req.met).length,
    [strength],
  )

  return (
    <div>
      <div
        className="mt-2 mb-1.5 h-1 w-full overflow-hidden rounded-full bg-subtle"
        role="progressbar"
        tabIndex={-1}
        aria-valuenow={strengthScore}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label="Password strength"
      >
        <div
          className="h-full transition-all duration-500 ease-out data-[score=1]:bg-red-500 data-[score=2]:bg-orange-500 data-[score=3]:bg-amber-500 data-[score=4]:bg-green-500"
          style={{ width: `${(strengthScore / 4) * 100}%` }}
          data-score={strengthScore}
        />
      </div>
      <p className="mb-1 font-medium text-sm">
        {t("passwordStrength", { score: strengthScore })}
      </p>
      <ul className="space-y-1" aria-label="Password requirements">
        {strength.map((req, i) => (
          <li key={i} className="flex items-center gap-2">
            {req.met && (
              <CheckIcon
                size={16}
                className="text-success"
                aria-hidden="true"
              />
            )}
            {!req.met && (
              <XIcon size={16} className="text-subtle/80" aria-hidden="true" />
            )}
            <span
              className="text-subtle text-xs data-[met=true]:text-success"
              data-met={req.met}
            >
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
