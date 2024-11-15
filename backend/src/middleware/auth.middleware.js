import { verifySession } from '../services/auth.service.js';

// Middleware для проверки сессии
export async function authenticateSession(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            status: 'error',
            code: 'NO_TOKEN',
            message: 'Authentication token is required'
        });
    }

    try {
        const user = await verifySession(token);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired session token'
            });
        }

        // Добавляем данные пользователя в request
        req.user = user;
        next();
    } catch (error) {
        console.error('Session authentication error:', error);
        return res.status(500).json({
            status: 'error',
            code: 'AUTH_ERROR',
            message: 'Authentication failed'
        });
    }
}
