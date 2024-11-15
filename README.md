# Quiz Application

Full-stack application for creating and managing quizzes with secure authentication system.

## Project Structure
```
Quiz/
├── frontend/        # React + TypeScript frontend
└── backend/        # Node.js + Express + SQLite backend
```

### Backend
```
backend/
├── src/
│   ├── routes/          # API routes
│   │   └── auth.js      # Authentication endpoints
│   ├── services/        # Business logic
│   │   └── auth.service.js
│   ├── validators/      # Input validation
│   │   └── auth.validator.js
│   ├── utils/          # Utility functions
│   │   ├── database.utils.js
│   │   └── email.js
│   └── middleware/     # Express middleware
│       └── auth.middleware.js
└── index.js           # Server entry point
```

### Frontend
```
frontend/
├── src/
│   ├── components/    # React components
│   │   └── Register/ # Registration module
│   ├── assets/       # Static assets
│   ├── App.tsx       # Main application component
│   ├── App.sass      # Main styles
│   └── main.tsx      # Application entry point
├── index.html        # HTML template
└── vite.config.ts    # Vite configuration
```

## Technology Stack

### Backend
- Node.js + Express
- SQLite database
- Abstract API for email validation
- Nodemailer for emails
- BCrypt for password hashing

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- SASS for styling
- Axios for API requests

## Features

### Authentication System
- Secure user registration with email verification
- Email validation using Abstract API
- Password strength validation
- Protection against disposable emails
- Session-based authentication
- Token-based email confirmation

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite

### Environment Variables
Create `.env` file in the backend directory with:
```env
# Server
PORT=3001
BASE_URL=http://localhost:3001

# Email Validation
EMAIL_VALIDATION_API_KEY=your_abstract_api_key

# Email (SMTP)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=your_from_email
```

### Backend Setup
1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm run dev
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Security Features
- Email validation and verification
- Password hashing with bcrypt
- Protection against:
  - Disposable emails
  - Weak passwords
  - Brute force attacks
  - Email enumeration
- Secure session management
- Rate limiting
- CORS protection

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user with email verification.
- Required fields: email, login, password
- Returns: Success message or error details

#### POST /api/auth/verify
Verify email with registration token.
- Required fields: token
- Returns: Success message or error details

#### POST /api/auth/login
Authenticate user and create session.
- Required fields: login/email, password
- Returns: Session token or error details

#### POST /api/auth/logout
End user session.
- Required: Valid session token
- Returns: Success message

## Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
