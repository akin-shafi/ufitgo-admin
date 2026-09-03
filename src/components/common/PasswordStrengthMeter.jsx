import { useMemo } from "react"

const strengthLevels = [
  { label: "Very Weak", color: "bg-danger", score: 1 },
  { label: "Weak", color: "bg-warning", score: 2 },
  { label: "Fair", color: "bg-info", score: 3 },
  { label: "Strong", color: "bg-success", score: 4 },
]

function calculateStrength(password) {
  let score = 0

  if (!password) return 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  return score
}

export function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => calculateStrength(password), [password])
  const level = strengthLevels[strength - 1]

  return (
    <div className="mt-2 space-y-2">
      {/* Bars */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              strength >= i
                ? level?.color || "bg-border"
                : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Label */}
      {strength > 0 && (
        <p className="text-xs text-fg/70">
          Password strength:{" "}
          <span className="font-medium text-fg">
            {level.label}
          </span>
        </p>
      )}

      {/* Hint */}
      <p className="text-xs text-fg/50">
        Use 8+ chars, uppercase, number & symbol
      </p>
    </div>
  )
}
