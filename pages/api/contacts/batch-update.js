import db from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { contacts } = req.body;

  if (!contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ message: 'A valid contacts array is required' });
  }

  const values = contacts.map(contact => [
    contact.name,
    contact.email,
    contact.phone,
    contact.address || null, // Optional field
    contact.timezone || null, // Optional field
    req.user.id // Replace with the authenticated user ID
  ]);

  const placeholders = contacts.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

  const query = `INSERT INTO contacts (name, email, phone, address, timezone, user_id) VALUES ${placeholders}`;

  db.query(query, values.flat(), (err, result) => {
    if (err) throw err;
    res.status(201).json({ message: `${contacts.length} contacts added successfully`, affectedRows: result.affectedRows });
  });
}
