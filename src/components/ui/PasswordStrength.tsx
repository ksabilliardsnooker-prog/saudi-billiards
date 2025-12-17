import { checkPasswordStrength } from '../../lib/utils'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const { score, label, color } = checkPasswordStrength(password)
  const percentage = (score / 6) * 100

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-dark-400">قوة كلمة المرور</span>
        <span className={`text-xs font-medium ${
          label === 'ضعيفة' ? 'text-red-400' :
          label === 'متوسطة' ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {label}
        </span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
