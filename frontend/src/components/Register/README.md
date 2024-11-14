# Register Component

A secure and user-friendly registration component for the Quiz application.

## Features

- Real-time input validation
- Password strength requirements
- Visual feedback for password rules
- Email and login availability checking
- Responsive design
- TypeScript support

## File Structure

- `Register.tsx` - Main component
- `Register.sass` - Styles
- `api.ts` - API calls (mock implementation)
- `validation.ts` - Validation logic
- `types.ts` - TypeScript interfaces

## Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

### Login Requirements
- Minimum 3 characters
- Must be unique

### Email Requirements
- Valid email format
- Must be unique
