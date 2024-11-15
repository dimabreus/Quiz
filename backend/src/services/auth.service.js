import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getDatabase } from '../database.js';
import { executeQuery, getOne } from '../utils/database.utils.js';

// Функция для генерации короткого токена регистрации
export function generateRegistrationToken() {
    return crypto.randomBytes(8).toString('base64url');
}

// Функция для генерации сессионного токена
export async function generateSessionToken(userId) {
    const token = crypto.randomBytes(16).toString('base64url');
    const db = await getDatabase();

    await executeQuery(
        db,
        'INSERT INTO sessions (token, user_id) VALUES (?, ?)',
        [token, userId]
    );

    return token;
}

// Функция для проверки сессии
export async function verifySession(token) {
    if (!token) return null;

    const db = await getDatabase();
    const session = await getOne(
        db,
        `SELECT s.*, u.login 
         FROM sessions s 
         JOIN users u ON u.id = s.user_id 
         WHERE s.token = ?`,
        [token]
    );

    if (!session) return null;

    // Обновляем время последнего использования
    await executeQuery(
        db,
        'UPDATE sessions SET last_used_at = CURRENT_TIMESTAMP WHERE token = ?',
        [token]
    );

    return {
        id: session.user_id,
        login: session.login
    };
}

// Функция для хеширования пароля
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

// Функция для проверки пароля
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}
