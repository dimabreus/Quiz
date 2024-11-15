import emailValidator from 'email-validator';

export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Invalid email format' };
    }

    if (email.length < 5 || email.length > 255) {
        return { isValid: false, message: 'Email must be between 5 and 255 characters' };
    }

    if (!emailValidator.validate(email)) {
        return { isValid: false, message: 'Invalid email format' };
    }

    return { isValid: true };
}

export function validateLogin(login) {
    if (!login || typeof login !== 'string') {
        return { isValid: false, message: 'Login must contain only latin letters, numbers and \'_\', length from 3 to 32 characters' };
    }

    if (login.length < 3 || login.length > 32) {
        return { isValid: false, message: 'Login must be between 3 and 32 characters' };
    }

    const loginRegex = /^[a-zA-Z0-9_]+$/;
    if (!loginRegex.test(login)) {
        return { isValid: false, message: 'Login must contain only latin letters, numbers and \'_\', length from 3 to 32 characters' };
    }

    return { isValid: true };
}

export function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password must contain at least 8 characters, one uppercase letter, one number and one special character' };
    }

    if (password.length < 8) {
        return { isValid: false, message: 'Password must contain at least 8 characters' };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\;'`~]/.test(password);

    if (!hasUpperCase || !hasNumber || !hasSpecialChar) {
        let message = 'Password must contain:';
        if (!hasUpperCase) message += ' an uppercase letter,';
        if (!hasNumber) message += ' a number,';
        if (!hasSpecialChar) message += ' a special character,';
        message = message.slice(0, -1); // Remove trailing comma
        return { isValid: false, message };
    }

    return { isValid: true };
}
