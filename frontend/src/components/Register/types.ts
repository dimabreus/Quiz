export interface FormData {
  email: string
  login: string
  password: string
}

export interface FormErrors {
  email?: string
  login?: string
  password?: string
  submit?: string
}

export interface PasswordValidation {
  minLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export interface PasswordValidationResult {
  errors: string[]
  validation: PasswordValidation
}
