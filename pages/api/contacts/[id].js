import db from '../../../config/db';
import moment from 'moment-timezone'; // Import moment-timezone for timezone conversions

export default function handler(req, res) {
  const contactId = req.query.id;

  db.query('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, req.user.id], (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const contact = result[0];

    // Convert the timestamps from UTC to the user's specified timezone
    if (contact.timezone) {
      contact.created_at = moment.utc(contact.created_at).tz(contact.timezone).format();
      contact.updated_at = moment.utc(contact.updated_at).tz(contact.timezone).format();
    }

    res.status(200).json(contact);
  });
}
