import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  checkEmailAvailability,
  checkLoginAvailability,
  registerUser,
} from './api'
import './Register.sass'
import { FormData, FormErrors, PasswordValidation } from './types'
import {
  validateEmailFormat,
  validateForm,
  validateLoginFormat,
  validatePassword,
} from './validation'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    login: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  // Мгновенная валидация при изменении полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Очищаем ошибки для поля
    setErrors(prev => ({ ...prev, [name]: undefined }))

    // Мгновенная валидация формата
    if (name === 'email' && value) {
      if (!validateEmailFormat(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
      }
    } else if (name === 'login' && value) {
      if (!validateLoginFormat(value)) {
        setErrors(prev => ({ ...prev, login: 'Login must be at least 3 characters long' }))
      }
    } else if (name === 'password') {
      const { validation } = validatePassword(value)
      setPasswordValidation(validation)
    }
  }

  // Отложенная валидация при потере фокуса
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (!value) return

    if (name === 'email' && validateEmailFormat(value)) {
      const isAvailable = await checkEmailAvailability(value)
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, email: 'This email is already taken' }))
      }
    } else if (name === 'login' && validateLoginFormat(value)) {
      const isAvailable = await checkLoginAvailability(value)
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, login: 'This login is already taken' }))
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const form = e.currentTarget.closest('form')
      if (form) {
        const inputs = Array.from(form.getElementsByTagName('input'))
        const currentIndex = inputs.indexOf(e.currentTarget as HTMLInputElement)
        const nextInput = inputs[currentIndex + 1]
        if (nextInput) {
          nextInput.focus()
        } else {
          handleSubmit(e as any)
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    
    if (!validateForm(formData, passwordValidation)) {
      return
    }


    if (Object.values(errors).some(error => error !== undefined)) {
      return
    }

    setIsLoading(true)

    try {
      const result = await registerUser(formData)
      if (result.success) {
        navigate('/login')
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: 'Registration failed. Please try again.',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Registration</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="login">Login:</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            required
          />
          {errors.login && <div className="error-message">{errors.login}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
          />
          <div className="password-validation">
            <div className={`validation-item ${passwordValidation.minLength ? 'valid' : ''}`}>
              At least 8 characters
            </div>
            <div className={`validation-item ${passwordValidation.hasUpperCase ? 'valid' : ''}`}>
              One uppercase letter
            </div>
            <div className={`validation-item ${passwordValidation.hasLowerCase ? 'valid' : ''}`}>
              One lowercase letter
            </div>
            <div className={`validation-item ${passwordValidation.hasNumber ? 'valid' : ''}`}>
              One number
            </div>
            <div className={`validation-item ${passwordValidation.hasSpecialChar ? 'valid' : ''}`}>
              One special character
            </div>
          </div>
        </div>

        {errors.submit && <div className="error-message">{errors.submit}</div>}

        <button 
          type="submit" 
          disabled={isLoading || !formData.email || !formData.login || !formData.password || 
                   !validateForm(formData, passwordValidation) || 
                   Object.values(errors).some(error => error !== undefined)}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
