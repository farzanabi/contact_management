import db from '../../../config/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { code, newPassword } = req.body;

  // Check if reset code is valid
  db.query('SELECT * FROM users WHERE reset_code = ?', [code], async (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const user = result[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset code
    db.query(
      'UPDATE users SET password = ?, reset_code = NULL WHERE id = ?',
      [hashedPassword, user.id],
      (err, result) => {
        if (err) throw err;

        res.status(200).json({ message: 'Password reset successful' });
      }
    );
  });
}
