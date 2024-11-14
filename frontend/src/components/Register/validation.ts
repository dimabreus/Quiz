import { FormData, PasswordValidation, PasswordValidationResult } from './types'

export const MIN_LOGIN_LENGTH = 3
export const MIN_PASSWORD_LENGTH = 8
export const SPECIAL_CHARACTERS = '!@#$%^&*'

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateLoginFormat = (login: string): boolean => {
  return login.length >= MIN_LOGIN_LENGTH
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const validation: PasswordValidation = {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: new RegExp(`[${SPECIAL_CHARACTERS}]`).test(password)
  }

  const errors: string[] = []
  
  if (!validation.minLength) errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
  if (!validation.hasUpperCase) errors.push('Password must contain at least one uppercase letter')
  if (!validation.hasLowerCase) errors.push('Password must contain at least one lowercase letter')
  if (!validation.hasNumber) errors.push('Password must contain at least one number')
  if (!validation.hasSpecialChar) errors.push(`Password must contain at least one special character (${SPECIAL_CHARACTERS})`)

  return { errors, validation }
}

export const isPasswordValid = (validation: PasswordValidation): boolean => {
  return Object.values(validation).every(value => value)
}

export const validateForm = (
  formData: FormData,
  passwordValidation: PasswordValidation
): boolean => {
  return (
    validateEmailFormat(formData.email) &&
    validateLoginFormat(formData.login) &&
    isPasswordValid(passwordValidation)
  )
}
