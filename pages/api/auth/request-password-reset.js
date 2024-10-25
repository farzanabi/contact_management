import db from '../../../config/db';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate a one-time reset code
    const resetCode = uuidv4();

    // Store the reset code in the database
    db.query('UPDATE users SET reset_code = ? WHERE email = ?', [resetCode, email], (err, result) => {
      if (err) throw err;

      // Send reset email
      const resetLink = `http://localhost:3000/api/auth/reset-password?code=${resetCode}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset',
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({ message: 'Error sending password reset email' });
        }
        res.status(200).json({ message: 'Password reset email sent successfully' });
      });
    });
  });
}
