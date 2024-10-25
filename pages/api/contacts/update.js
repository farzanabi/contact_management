import db from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end();

  const { contactId, name, email, phone, address, timezone } = req.body;

  if (!contactId) return res.status(400).json({ message: 'Contact ID is required' });

  // Construct the update query dynamically based on fields provided
  let query = 'UPDATE contacts SET';
  const queryParams = [];

  if (name) {
    query += ' name = ?,';
    queryParams.push(name);
  }
  if (email) {
    query += ' email = ?,';
    queryParams.push(email);
  }
  if (phone) {
    query += ' phone = ?,';
    queryParams.push(phone);
  }
  if (address) {
    query += ' address = ?,';
    queryParams.push(address);
  }
  if (timezone) {
    query += ' timezone = ?,';
    queryParams.push(timezone);
  }

  // Remove trailing comma and finalize the query
  query = query.slice(0, -1);
  query += ' WHERE id = ? AND user_id = ? AND deleted_at IS NULL';
  queryParams.push(contactId, req.user.id);

  db.query(query, queryParams, (err, result) => {
    if (err) throw err;

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact not found or already deleted' });
    }

    res.status(200).json({ message: 'Contact updated successfully' });
  });
}
