```markdown
# Contact Management System

A full-stack **Contact Management System** built using **Next.js** for the frontend and backend, with **MySQL** as the database. The system allows users to register, authenticate, and manage their contacts. It supports features like bulk contact creation via file uploads, JWT authentication, email verification, and more.

## Features

- **User Authentication**:
  - Register with email verification.
  - Login with JWT tokens.
  - Password reset via email with OTP.
  
- **Contact Management**:
  - Add, edit, delete, and retrieve contacts.
  - Bulk contact creation via CSV/Excel upload.
  - Filtering, sorting, and pagination of contacts.
  
- **Security**:
  - Rate limiting on sensitive endpoints (registration, login).
  - Password hashing with **bcrypt**.
  
- **File Handling**:
  - Upload and parse CSV/Excel files for bulk contact creation.
  - Export contacts to CSV/Excel.

- **Database**:
  - MySQL with connection pooling for improved performance.
  - Normalized database schema with user-contact relationship.

## Technology Stack

- **Next.js** (for both frontend and backend API)
- **MySQL** (for database)
- **Node.js** (runtime)
- **bcryptjs** (for password hashing)
- **jsonwebtoken** (for JWT authentication)
- **nodemailer** (for sending emails)
- **Joi** (for data validation)
- **Multer** (for file handling)
- **express-rate-limit** (for rate limiting)
- **csv-parser** and **xlsx** (for parsing CSV/Excel files)

## Prerequisites

- **Node.js** (version 12 or higher)
- **MySQL** (version 5.7 or higher)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/contact-management-system.git
cd contact-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following values:

```bash
# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=user
MYSQL_PASSWORD=password
MYSQL_DATABASE=contact_management

# JWT Secret
JWT_SECRET=your_jwt_secret

# Nodemailer Email Configuration (Gmail example)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

### 4. Setup the MySQL Database

1. Start your MySQL server.
2. Create a new database:
   ```sql
   CREATE DATABASE contact_management;
   ```

3. Run the following SQL commands to create the `users` and `contacts` tables:

```sql
-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(255),
    reset_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address VARCHAR(255),
    timezone VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. Start the Development Server

```bash
npm run dev
```

This will start the Next.js development server on `http://localhost:3000`.

## API Endpoints

### User Authentication

- **POST** `/api/auth/register` - Register a new user.
- **POST** `/api/auth/login` - Log in an existing user and get a JWT token.
- **POST** `/api/auth/request-password-reset` - Request a password reset link.
- **POST** `/api/auth/reset-password` - Reset the password using an OTP.

### Contact Management

- **GET** `/api/contacts` - Get a list of contacts (with filtering and pagination).
- **POST** `/api/contacts/add` - Add a new contact.
- **PUT** `/api/contacts/update` - Update an existing contact.
- **DELETE** `/api/contacts/delete` - Soft delete a contact.
- **POST** `/api/contacts/upload` - Upload a CSV/Excel file for bulk contact creation.
- **GET** `/api/contacts/download?format=csv` - Download all contacts as CSV.
- **GET** `/api/contacts/download?format=excel` - Download all contacts as Excel.

## Security Features

- **Rate Limiting**: Login and registration endpoints are rate-limited to prevent abuse (5 requests per 15 minutes per IP).
- **Password Hashing**: Passwords are securely hashed using **bcrypt**.
- **JWT Authentication**: Secures API routes for authenticated users.
- **Email Verification**: Users must verify their email before accessing certain features.

## File Handling

- Upload and parse CSV/Excel files for bulk contact creation.
- Supports downloading all contacts as CSV or Excel files.

## Troubleshooting

- If you encounter database connection errors, check your MySQL configuration and ensure the database credentials in your `.env.local` file are correct.
- For email issues, ensure you have enabled **Less Secure Apps** in your Gmail account or use a proper email service for production environments.

## Contributing

Contributions are welcome! If you'd like to contribute, please fork the repository and submit a pull request.

1. Fork the repository
2. Create a new branch: `git checkout -b feature-branch`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-branch`
5. Open a pull request


Here’s a step-by-step guide on how to set up the **Contact Management System** project locally on your machine.


### Step 6: Testing the Application

You can test the application using tools like **Postman** or **curl**. Here are some key API routes you can test:

#### Register a New User

```bash
POST http://localhost:3000/api/auth/register

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Log in an Existing User

```bash
POST http://localhost:3000/api/auth/login

Body:
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Upload CSV for Bulk Contact Creation

```bash
POST http://localhost:3000/api/contacts/upload

Upload a CSV or Excel file with the following columns: `name`, `email`, `phone`, `address`, `timezone`.
```

### Troubleshooting

- **Database Connection Issues**: Ensure the MySQL server is running and the credentials in your `.env.local` file are correct.
  
- **Nodemailer Email Issues**: Make sure you enable **Less Secure Apps** for your Gmail account if you're using Gmail in development.

- **Port Conflicts**: If `localhost:3000` is already in use, you can change the port by specifying a different port number when running the app:
  ```bash
  PORT=3001 npm run dev
  ```

### Additional Commands

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Start Production Server**:
  ```bash
  npm start
  ```


```

## License

This project is licensed under the MIT License.
```

