import { FormData } from './types'

// Симуляция API запросов
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  await delay(1000) // Имитация задержки сети
  // В реальном приложении здесь будет API запрос
  return !['test@test.com', 'admin@admin.com'].includes(email)
}

export const checkLoginAvailability = async (login: string): Promise<boolean> => {
  await delay(1000) // Имитация задержки сети
  // В реальном приложении здесь будет API запрос
  return !['admin', 'test', 'user'].includes(login)
}

export const registerUser = async (
  formData: FormData
): Promise<{ success: boolean; message?: string }> => {
  await delay(1500) // Имитация задержки сети
  
  // Имитация успешной регистрации
  return {
    success: true,
    message: 'Registration successful!'
  }
}
