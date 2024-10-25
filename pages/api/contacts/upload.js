import db from '../../../config/db';
import multer from 'multer';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import Joi from 'joi';
import fs from 'fs';
import path from 'path';

// Configure multer
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 1000000 } });

// Joi schema for contact validation
const contactSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]+$/).min(7).max(15).required(),
  address: Joi.string().max(255).optional(),
  timezone: Joi.string().optional(),
});

// Parse CSV files
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const contacts = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => contacts.push(data))
      .on('end', () => resolve(contacts))
      .on('error', reject);
  });
};

// Parse Excel files
const parseExcelFile = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

// Validate contacts
const validateContacts = (contacts) => {
  const validContacts = [];
  const invalidContacts = [];
  
  contacts.forEach((contact) => {
    const { error } = contactSchema.validate(contact);
    if (error) {
      invalidContacts.push({ contact, error: error.details[0].message });
    } else {
      validContacts.push(contact);
    }
  });

  return { validContacts, invalidContacts };
};

export default async function handler(req, res) {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(500).json({ message: 'File upload failed', error: err.message });

    const filePath = path.join(process.cwd(), req.file.path);
    let contacts = [];

    try {
      if (req.file.mimetype === 'text/csv') {
        contacts = await parseCSVFile(filePath);
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        contacts = parseExcelFile(filePath);
      } else {
        return res.status(400).json({ message: 'Unsupported file format. Only CSV and Excel are allowed.' });
      }

      // Validate contacts
      const { validContacts, invalidContacts } = validateContacts(contacts);

      if (invalidContacts.length > 0) {
        return res.status(400).json({ message: 'Validation failed', invalidContacts });
      }

      // Start MySQL transaction
      await db.beginTransaction();

      // Insert or update contacts in the database
      const values = validContacts.map(contact => [
        contact.name,
        contact.email,
        contact.phone,
        contact.address || null,
        contact.timezone || null,
        req.user.id,
      ]);

      const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');

      await db.query(`INSERT INTO contacts (name, email, phone, address, timezone, user_id) VALUES ${placeholders}`, values.flat());

      // Commit the transaction
      await db.commit();

      res.status(201).json({ message: 'Contacts added successfully', insertedCount: validContacts.length });
    } catch (error) {
      // Rollback transaction in case of an error
      await db.rollback();
      res.status(500).json({ message: 'File processing error', error: error.message });
    } finally {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
