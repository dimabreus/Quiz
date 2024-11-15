import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/auth.js';
import { initDatabase } from './database.js';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        status: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many registration attempts. Please try again later.'
    }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Setup logging
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);

// Logging middleware
app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); // Console logging in development
}

// Apply rate limiting
app.use('/auth/register', authLimiter); // Строгий лимит на регистрацию
app.use('/api', apiLimiter); // Общий лимит на API

// Middleware для обработки JSON с отловом ошибок
app.use((req, res, next) => {
    express.json()(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                status: 'error',
                code: 'INVALID_JSON',
                message: 'Invalid JSON in request body'
            });
        }
        next();
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/auth', authRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'Requested resource not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Log error
    console.error('Error:', {
        timestamp: new Date().toISOString(),
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // Send error response
    res.status(err.status || 500).json({
        status: 'error',
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Initialize database and start server
const PORT = process.env.PORT || 3001;

initDatabase().then(() => {
    const server = app.listen(PORT, () => {
        console.log(`
🚀 Server is running on port ${PORT}

Available routes:
- GET  /health           Health check
- POST /auth/register    Register new user
- POST /auth/verify      Verify email
- POST /auth/login       User login
- POST /auth/logout      User logout

Environment: ${process.env.NODE_ENV || 'development'}
        `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received. Closing server...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
