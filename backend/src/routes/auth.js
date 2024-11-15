import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import crypto from 'crypto';
import { getDatabase } from '../database.js';
import { sendConfirmationEmail } from '../utils/email.js';
import { validateEmail, validateLogin, validatePassword } from '../validators/auth.validator.js';
import { generateRegistrationToken, generateSessionToken, hashPassword, verifyPassword } from '../services/auth.service.js';
import { getOne, executeQuery, handleDatabaseError } from '../utils/database.utils.js';

const router = express.Router();

// Email validation configuration
const EMAIL_VALIDATION_API_KEY = process.env.EMAIL_VALIDATION_API_KEY;
const EMAIL_VALIDATION_URL = 'https://emailvalidation.abstractapi.com/v1/';

router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                status: 'error',
                code: 'MISSING_FIELDS',
                message: 'Login and password are required'
            });
        }

        const db = await getDatabase();

        // Получаем пользователя
        const user = await new Promise((resolve, reject) => {
            db.get(
                'SELECT id, login, password_hash FROM users WHERE login = ?',
                [login],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid login or password'
            });
        }

        // Проверяем пароль
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid login or password'
            });
        }

        // Создаем сессионный токен
        const token = await generateSessionToken(user.id);

        return res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    login: user.login
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: 'error',
            code: 'LOGIN_FAILED',
            message: 'Login failed'
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, login, password } = req.body;

        if (!email || !login || !password) {
            return res.status(400).json({
                status: 'error',
                code: 'MISSING_FIELDS',
                message: 'Email, login and password are required'
            });
        }

        // Сначала проверяем email через Abstract API
        try {
            const emailValidation = await validateEmail(email);
            if (!emailValidation.isValid) {
                return res.status(400).json({
                    status: 'error',
                    code: 'INVALID_EMAIL',
                    message: emailValidation.message
                });
            }
        } catch (error) {
            console.error('Email validation error:', error);
            return res.status(400).json({
                status: 'error',
                code: 'EMAIL_VALIDATION_FAILED',
                message: 'Unable to validate email address. Please try again later.'
            });
        }

        const db = await getDatabase();

        // Validate login
        const loginValidation = validateLogin(login);
        if (!loginValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_LOGIN',
                message: loginValidation.message
            });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_PASSWORD',
                message: passwordValidation.message
            });
        }

        // Check if email/login already exists
        try {
            const existingUser = await getOne(
                db,
                'SELECT email, login FROM users WHERE email = ? OR login = ?',
                [email, login]
            );

            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({
                        status: 'error',
                        code: 'EMAIL_EXISTS',
                        message: 'Email already registered'
                    });
                }
                if (existingUser.login === login) {
                    return res.status(400).json({
                        status: 'error',
                        code: 'LOGIN_EXISTS',
                        message: 'Login already taken'
                    });
                }
            }
        } catch (error) {
            return handleDatabaseError(error, res);
        }

        // Check if registration token already exists and is not expired
        try {
            const existingToken = await getOne(
                db,
                'SELECT created_at FROM registration_tokens WHERE email = ? AND created_at > datetime("now", "-1 day")',
                [email]
            );

            if (existingToken) {
                return res.status(400).json({
                    status: 'error',
                    code: 'TOKEN_EXISTS',
                    message: 'Confirmation email was already sent. Please check your email or try again in 24 hours.'
                });
            }
        } catch (error) {
            return handleDatabaseError(error, res);
        }

        // Generate registration token and hash password
        const token = generateRegistrationToken();
        const hashedPassword = await hashPassword(password);

        // Отправляем email
        try {
            await sendConfirmationEmail(email, token);
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({
                status: 'error',
                code: 'EMAIL_SEND_FAILED',
                message: 'Failed to send confirmation email. Please try again later.'
            });
        }

        // Сохраняем токен только если письмо успешно отправлено
        try {
            await executeQuery(
                db,
                'INSERT INTO registration_tokens (email, login, password_hash, token, created_at, expires_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now", "+1 day"))',
                [email, login, hashedPassword, token]
            );

            return res.status(200).json({
                status: 'success',
                message: 'Registration initiated. Please check your email for confirmation.'
            });
        } catch (error) {
            return handleDatabaseError(error, res);
        }

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            status: 'error',
            code: 'REGISTRATION_FAILED',
            message: 'Registration failed. Please try again later.'
        });
    }
});

router.post('/approve-register', async (req, res) => {
    const { token } = req.body;
    const db = await getDatabase();

    if (!token) {
        return res.status(400).json({
            status: 'error',
            code: 'MISSING_TOKEN',
            message: 'Token is required'
        });
    }

    try {
        // Получаем данные по токену
        const registration = await new Promise((resolve, reject) => {
            db.get(
                'SELECT email, login, password_hash, expires_at FROM registration_tokens WHERE token = ?',
                [token],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!registration) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired token'
            });
        }

        // Проверяем срок действия токена
        if (new Date(registration.expires_at) < new Date()) {
            return res.status(400).json({
                status: 'error',
                code: 'TOKEN_EXPIRED',
                message: 'Token has expired'
            });
        }

        // Начинаем транзакцию
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        try {
            // Создаем пользователя
            const result = await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (email, login, password_hash) VALUES (?, ?, ?)',
                    [registration.email, registration.login, registration.password_hash],
                    function(err) {
                        if (err) reject(err);
                        else resolve(this);
                    }
                );
            });

            // Удаляем использованный токен
            await new Promise((resolve, reject) => {
                db.run(
                    'DELETE FROM registration_tokens WHERE token = ?',
                    [token],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            // Создаем сессионный токен
            const sessionToken = await generateSessionToken(result.lastID);

            await new Promise((resolve, reject) => {
                db.run('COMMIT', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    token: sessionToken,
                    user: {
                        login: registration.login
                    }
                }
            });

        } catch (error) {
            await new Promise((resolve) => {
                db.run('ROLLBACK', () => resolve());
            });
            throw error;
        }

    } catch (error) {
        console.error('Approval error:', error);
        return res.status(500).json({
            status: 'error',
            code: 'APPROVAL_FAILED',
            message: 'Registration approval failed'
        });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({
                status: 'error',
                code: 'MISSING_TOKEN',
                message: 'Token is required'
            });
        }

        const db = await getDatabase();

        // Удаляем сессию
        await new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM sessions WHERE token = ?',
                [token],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        return res.status(200).json({
            status: 'success',
            message: 'Successfully logged out'
        });

    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            status: 'error',
            code: 'LOGOUT_FAILED',
            message: 'Logout failed'
        });
    }
});

export default router;
