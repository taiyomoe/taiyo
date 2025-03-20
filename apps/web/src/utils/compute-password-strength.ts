const requirements = [
  { id: "strengthChars", regex: /.{8,}/ },
  { id: "strengthNumbers", regex: /[0-9]/ },
  { id: "strengthLowercase", regex: /[a-z]/ },
  { id: "strengthUppercase", regex: /[A-Z]/ },
  { id: "strengthSpecial", regex: /[!@#$%^&*(),.?":{}|<>]/ },
] as const

export const computePasswordStrength = (input: string) =>
  requirements.map((req) => ({
    id: req.id,
    met: req.regex.test(input),
  }))
