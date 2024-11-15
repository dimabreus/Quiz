# Quiz Backend

Backend service for the Quiz application with secure authentication system.

## Features

### Authentication System
- Secure user registration with email verification
- Comprehensive email validation using Abstract API
- Password strength validation
- Protection against disposable emails
- Session-based authentication
- Token-based email confirmation

## Project Structure
```
src/
├── routes/          # API routes
│   └── auth.js      # Authentication endpoints
├── services/        # Business logic
│   └── auth.service.js
├── validators/      # Input validation
│   └── auth.validator.js
├── utils/          # Utility functions
│   ├── database.utils.js
│   └── email.js
├── middleware/     # Express middleware
│   └── auth.middleware.js
└── index.js       # Server entry point
```

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory with:
```env
# Server Configuration
PORT=3001
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Email Validation
EMAIL_VALIDATION_API_KEY=your_abstract_api_key

# SMTP Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_from_email
```

3. Start development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

#### POST /auth/register
Register new user with email verification.
- **Body**:
```json
{
    "email": "user@example.com",
    "login": "username",
    "password": "StrongP@ss123"
}
```
- **Success Response**: 
```json
{
    "status": "success",
    "message": "Registration initiated. Please check your email for confirmation."
}
```

#### POST /auth/verify
Verify email with registration token.
- **Body**:
```json
{
    "token": "registration_token"
}
```
- **Success Response**:
```json
{
    "status": "success",
    "message": "Email verified successfully"
}
```

#### POST /auth/login
Authenticate user and create session.
- **Body**:
```json
{
    "login": "username",
    "password": "StrongP@ss123"
}
```
- **Success Response**:
```json
{
    "status": "success",
    "data": {
        "token": "session_token",
        "user": {
            "login": "username"
        }
    }
}
```

#### POST /auth/logout
End user session.
- **Headers**: `Authorization: Bearer session_token`
- **Success Response**:
```json
{
    "status": "success",
    "message": "Logged out successfully"
}
```

### Error Responses
All errors follow this format:
```json
{
    "status": "error",
    "code": "ERROR_CODE",
    "message": "Detailed error message"
}
```

Common error codes:
- `MISSING_FIELDS`: Required fields are missing
- `INVALID_EMAIL`: Email validation failed
- `INVALID_LOGIN`: Login format is invalid
- `INVALID_PASSWORD`: Password doesn't meet requirements
- `EMAIL_EXISTS`: Email already registered
- `LOGIN_EXISTS`: Login already taken
- `TOKEN_EXISTS`: Registration token already sent
- `EMAIL_SEND_FAILED`: Failed to send confirmation email
- `INVALID_TOKEN`: Invalid or expired token
- `AUTH_ERROR`: Authentication failed

## Security Features

### Email Validation
- Format validation
- Deliverability check
- Disposable email detection
- Quality score assessment

### Password Security
- Minimum 8 characters
- Must contain:
  * Uppercase letters
  * Lowercase letters
  * Numbers
  * Special characters
- BCrypt hashing

### Request Protection
- Rate limiting
- CORS protection
- Helmet security headers
- JSON body size limits

### Session Management
- Secure session tokens
- Token expiration
- Session invalidation

## Logging
- Access logging (morgan)
- Error logging
- Development/Production modes

## Health Check
- Endpoint: GET /health
- Returns server status and uptime

## Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent error handling
- Clean code practices
