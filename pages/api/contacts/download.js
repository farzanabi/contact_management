import db from '../../../config/db';
import fastcsv from 'fast-csv';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const generateCSV = (contacts, res) => {
  const csvStream = fastcsv.format({ headers: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');

  csvStream.pipe(res);
  contacts.forEach((contact) => {
    csvStream.write(contact);
  });
  csvStream.end();
};

const generateExcel = (contacts, res) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(contacts);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

  const tempFilePath = path.join(process.cwd(), 'contacts.xlsx');
  XLSX.writeFile(workbook, tempFilePath);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');

  res.download(tempFilePath, (err) => {
    if (err) throw err;
    fs.unlinkSync(tempFilePath); // Clean up the file after sending
  });
};

export default function handler(req, res) {
  const { format } = req.query;

  db.query('SELECT * FROM contacts WHERE user_id = ? AND deleted_at IS NULL', [req.user.id], (err, results) => {
    if (err) throw err;

    const contacts = results.map((contact) => ({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      timezone: contact.timezone,
      created_at: contact.created_at,
      updated_at: contact.updated_at,
    }));

    if (format === 'csv') {
      generateCSV(contacts, res);
    } else if (format === 'excel') {
      generateExcel(contacts, res);
    } else {
      res.status(400).json({ message: 'Invalid format. Use csv or excel.' });
    }
  });
}
