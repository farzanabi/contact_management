import db from '../../../config/db';
import moment from 'moment-timezone'; // Import moment-timezone for timezone conversions

export default function handler(req, res) {
  const { name, email, timezone, sortBy, sortOrder, startDate, endDate } = req.query;

  let query = 'SELECT * FROM contacts WHERE deleted_at IS NULL AND user_id = ?';
  let queryParams = [req.user.id]; // Replace with authenticated user ID

  // Add filtering options for name, email, and timezone
  if (name) {
    query += ' AND name LIKE ?';
    queryParams.push(`%${name}%`);
  }
  if (email) {
    query += ' AND email LIKE ?';
    queryParams.push(`%${email}%`);
  }
  if (timezone) {
    query += ' AND timezone = ?';
    queryParams.push(timezone);
  }

  // Date range filtering (if both startDate and endDate are provided)
  if (startDate && endDate && timezone) {
    const startUTC = moment.tz(startDate, timezone).utc().format('YYYY-MM-DD HH:mm:ss');
    const endUTC = moment.tz(endDate, timezone).utc().format('YYYY-MM-DD HH:mm:ss');
    query += ' AND created_at BETWEEN ? AND ?';
    queryParams.push(startUTC, endUTC);
  }

  // Add sorting options for name or email
  if (sortBy && (sortBy === 'name' || sortBy === 'email')) {
    const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortBy} ${order}`;
  }

  // Execute the query
  db.query(query, queryParams, (err, results) => {
    if (err) throw err;

    // Convert timestamps to the user's specified timezone (if provided)
    const contacts = results.map(contact => {
      if (contact.timezone) {
        contact.created_at = moment.utc(contact.created_at).tz(contact.timezone).format();
        contact.updated_at = moment.utc(contact.updated_at).tz(contact.timezone).format();
      }
      return contact;
    });

    // Return the filtered and sorted contacts
    res.status(200).json(contacts);
  });
}
