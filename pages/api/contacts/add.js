import db from '../../../config/db';
import Joi from 'joi'; // Import Joi

// Define Joi schema for validating contact input
const contactSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(), // Name must be between 3 and 100 characters
  email: Joi.string().email().required(), // Must be a valid email address
  phone: Joi.string().pattern(/^[0-9]+$/).min(7).max(15).required(), // Must be a valid phone number (digits only, between 7 and 15 digits)
  address: Joi.string().max(255).optional(), // Address is optional, max length 255 characters
  timezone: Joi.string().optional(), // Timezone is optional
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, phone, address, timezone } = req.body;

  // Validate the request body using Joi
  const { error } = contactSchema.validate({ name, email, phone, address, timezone });

  if (error) {
    // If validation fails, send a 400 response with the validation error message
    return res.status(400).json({ message: error.details[0].message });
  }

  // Insert contact into the database
// Insert contact into the database
    db.query(
    'INSERT INTO contacts (name, email, phone, address, timezone, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, address, timezone, req.user.id],
    (err, result) => {
      if (err) throw err;
      res.status(201).json({ message: 'Contact added successfully', contactId: result.insertId });
    }
  );
  
}
