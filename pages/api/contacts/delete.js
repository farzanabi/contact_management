import db from '../../../config/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  const { contactId } = req.body;

  if (!contactId) return res.status(400).json({ message: 'Contact ID is required' });

  const deletedAt = new Date();

  db.query(
    'UPDATE contacts SET deleted_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
    [deletedAt, contactId, req.user.id],
    (err, result) => {
      if (err) throw err;

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Contact not found or already deleted' });
      }

      res.status(200).json({ message: 'Contact soft deleted successfully' });
    }
  );
}
