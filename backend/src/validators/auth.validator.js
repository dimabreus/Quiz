import axios from 'axios';

const EMAIL_VALIDATION_API_KEY = process.env.EMAIL_VALIDATION_API_KEY;
const EMAIL_VALIDATION_URL = 'https://emailvalidation.abstractapi.com/v1/';

// Валидация email через Abstract API
export async function validateEmail(email) {
    try {
        const response = await axios.get(EMAIL_VALIDATION_URL, {
            params: {
                api_key: EMAIL_VALIDATION_API_KEY,
                email: email
            }
        });

        const data = response.data;

        // Проверяем формат email
        if (!data.is_valid_format.value) {
            return {
                isValid: false,
                message: 'Invalid email format'
            };
        }

        // Проверяем возможность доставки
        if (data.deliverability === 'UNDELIVERABLE') {
            return {
                isValid: false,
                message: 'Email address appears to be undeliverable'
            };
        }

        // Проверяем, является ли это одноразовым email
        if (data.is_disposable_email.value) {
            return {
                isValid: false,
                message: 'Disposable email addresses are not allowed'
            };
        }

        // Проверяем качество и риск
        if (data.quality_score < 0.7) { 
            return {
                isValid: false,
                message: 'This email address appears to be invalid or risky'
            };
        }

        return {
            isValid: true
        };

    } catch (error) {
        console.error('Email validation error:', error);
        throw new Error('EMAIL_VALIDATION_FAILED');
    }
}

// Валидация логина
export function validateLogin(login) {
    // Минимум 3 символа, максимум 20, только буквы, цифры и _
    const loginRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    if (!loginRegex.test(login)) {
        return {
            isValid: false,
            message: 'Login must be 3-20 characters long and contain only letters, numbers and underscore'
        };
    }

    return {
        isValid: true
    };
}

// Валидация пароля
export function validatePassword(password) {
    // Минимум 8 символов
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    // Проверяем наличие хотя бы одной заглавной буквы
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter'
        };
    }

    // Проверяем наличие хотя бы одной строчной буквы
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter'
        };
    }

    // Проверяем наличие хотя бы одной цифры
    if (!/[0-9]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one number'
        };
    }

    // Проверяем наличие хотя бы одного специального символа
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one special character'
        };
    }

    return {
        isValid: true
    };
}
