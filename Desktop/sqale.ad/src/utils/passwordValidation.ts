export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'fair' | 'good' | 'strong'
}

export interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
  met?: boolean
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'Contains lowercase letter',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'Contains number',
    test: (pwd) => /[0-9]/.test(pwd),
  },
  {
    label: 'Contains special character (!@#$%^&*)',
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
]

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []
  let metCount = 0

  // Check minimum length (mandatory)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    metCount++
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    metCount++
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    metCount++
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    metCount++
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  } else {
    metCount++
  }

  // Check for common passwords (basic check)
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'password1', '123456789', 'letmein', 'welcome', 'admin123'
  ]
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a more unique password')
  }

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    errors.push('Password should not contain sequential characters')
  }

  // Calculate strength
  let strength: 'weak' | 'fair' | 'good' | 'strong' = 'weak'
  if (errors.length === 0) {
    if (password.length >= 12 && metCount === 5) {
      strength = 'strong'
    } else if (password.length >= 10 && metCount >= 4) {
      strength = 'good'
    } else {
      strength = 'fair'
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

export const checkPasswordRequirements = (password: string): PasswordRequirement[] => {
  return passwordRequirements.map(req => ({
    ...req,
    met: req.test(password),
  }))
}

export const getPasswordStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'strong':
      return 'text-green-600'
    case 'good':
      return 'text-blue-600'
    case 'fair':
      return 'text-yellow-600'
    case 'weak':
    default:
      return 'text-red-600'
  }
}

export const getPasswordStrengthBgColor = (strength: string): string => {
  switch (strength) {
    case 'strong':
      return 'bg-green-500'
    case 'good':
      return 'bg-blue-500'
    case 'fair':
      return 'bg-yellow-500'
    case 'weak':
    default:
      return 'bg-red-500'
  }
}
