import db from '../../../config/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  // Check if the verification code exists
  db.query('SELECT * FROM users WHERE verification_code = ?', [code], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const user = result[0];

    // Mark the user as verified
    db.query('UPDATE users SET verified = true, verification_code = NULL WHERE id = ?', [user.id], (err, updateResult) => {
      if (err) throw err;

      // Generate JWT token after successful verification
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'Email verified successfully', token });
    });
  });
}
