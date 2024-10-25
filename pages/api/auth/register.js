import db from '../../../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi'; // Import Joi

// Create the Joi schema for validating user registration input
const userSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(), // Name must be between 3 and 100 characters
  email: Joi.string().email().required(), // Must be a valid email address
  password: Joi.string().min(6).max(255).required(), // Password must be between 6 and 255 characters
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, password } = req.body;

  // Validate the request body using Joi
  const { error } = userSchema.validate({ name, email, password });

  if (error) {
    // If validation fails, send a 400 response with the validation error message
    return res.status(400).json({ message: error.details[0].message });
  }

  // Check if user exists
  db.query('SELECT email FROM users WHERE email = ?', [email], async (err, result) => {
    if (err) throw err;

    if (result.length > 0) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification code
    const verificationCode = uuidv4();

    // Save user in the database
    db.query(
      'INSERT INTO users (name, email, password, verification_code) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, verificationCode],
      async (err, result) => {
        if (err) throw err;

        // Send verification email
        const verificationLink = `http://localhost:3000/api/auth/verify-email?code=${verificationCode}`;
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify Your Email',
          html: `<p>Please verify your email by clicking on the following link:</p><a href="${verificationLink}">Verify Email</a>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: 'Error sending verification email' });
          }

          // Generate JWT token after registration
          const token = jwt.sign({ id: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

          // Return both registration success message and JWT token
          res.status(201).json({ message: 'User registered successfully. Please verify your email.', token });
        });
      }
    );
  });
}
