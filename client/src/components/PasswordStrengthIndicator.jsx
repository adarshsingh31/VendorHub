function scorePassword(pw = '') {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const levels = [
  { label: 'Very weak', color: 'bg-danger-500', text: 'text-danger-500' },
  { label: 'Weak', color: 'bg-danger-500', text: 'text-danger-500' },
  { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' },
  { label: 'Strong', color: 'bg-local-500', text: 'text-local-600' },
  { label: 'Very strong', color: 'bg-local-500', text: 'text-local-600' },
]

export default function PasswordStrengthIndicator({ password = '' }) {
  if (!password) return null
  const score = scorePassword(password)
  const level = levels[score]

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? level.color : 'bg-surface-sunken'
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs font-medium ${level.text}`}>{level.label} password</p>
    </div>
  )
}
