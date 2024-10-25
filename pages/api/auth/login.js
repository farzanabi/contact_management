import db from '../../../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginLimiter } from '../../../middlewares/rateLimiter';

export default async function handler(req, res) {
  // Apply rate limiting
  loginLimiter(req, res, async () => {
    if (req.method !== 'POST') return res.status(405).end();

    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
      if (err) throw err;

      if (result.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = result[0];

      // Check if the password matches
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ token });
    });
  });
}
