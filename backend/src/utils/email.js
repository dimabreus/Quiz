import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendConfirmationEmail(email, token) {
    const confirmationUrl = `${process.env.BASE_URL}/register?Token=${token}`;
    
    const mailOptions = {
        from: {
            name: 'Quiz App',
            address: process.env.SMTP_USER
        },
        to: email,
        subject: 'Confirm registration on Quiz',
        html: `
            <h1>Welcome to Quiz!</h1>
            <p>Please confirm your registration by clicking the link below:</p>
            <a href="${confirmationUrl}">Confirm Registration</a>
            <p>If you didn't request this registration, please ignore this email.</p>
            <p>The link will expire in 24 hours.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
