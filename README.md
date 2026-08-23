# PHP LMS Project

A complete full-stack Learning Management System built with **React.js** (Frontend) + **Core PHP REST API** (Backend) + **MySQL**.

## Features

- **3 Roles**: Admin, Teacher, Student
- Authentication (JWT-like token based)
- Course Management (Create, Edit, Publish, Categories)
- Chapters & Lessons with drag-and-drop sorting
- Student Enrollment & Progress Tracking
- Video Lessons + Mark as Complete
- Quiz System (MCQ, True/False, Multiple)
- Certificates on course completion
- Reviews & Ratings
- Wishlist
- Responsive Bootstrap UI

## Requirements

- XAMPP (Apache + MySQL + PHP 8+)
- Node.js 18+ & npm
- phpMyAdmin

## Installation

### 1. Database Setup

1. Start **XAMPP** → Start Apache + MySQL
2. Open phpMyAdmin → http://localhost/phpmyadmin
3. Import the schema:
   - Go to **Import** → Choose `backend/database/schema.sql` → Go
4. Import seed data:
   - Import `backend/database/seed.sql`

### 2. Backend Setup

1. Copy the entire `php-lms-project` folder to:
   ```
   C:\xampp\htdocs\php-lms-project\
   ```
2. Test connection:
   ```
   http://localhost/php-lms-project/backend/api/test-connection.php
   ```
   You should see: `"Database connected successfully"`

### 3. Frontend Setup

```bash
cd php-lms-project/frontend
npm install
npm run dev
```

Open: **http://localhost:5173**

### 4. Important: Fix Password Hash

The seed data uses a demo hash. Generate a real one:

Create a file `backend/generate_hash.php`:

```php
<?php
echo password_hash("password123", PASSWORD_DEFAULT);
```

Run it: `http://localhost/php-lms-project/backend/generate_hash.php`

Then in phpMyAdmin run:

```sql
UPDATE users SET password = 'PASTE_THE_HASH_HERE' WHERE email LIKE '%@lms.com';
```

## Demo Credentials

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@lms.com     | password123 |
| Teacher | teacher@lms.com   | password123 |
| Student | student@lms.com   | password123 |

## Project Structure

```
php-lms-project/
├── frontend/                 # React + Vite + Bootstrap
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── .env
│
├── backend/                  # Core PHP REST API
│   ├── api/                  # All endpoints
│   ├── config/               # database.php
│   ├── helpers/              # response, token, upload
│   ├── middleware/           # auth.php
│   ├── uploads/              # course images, resources
│   └── database/             # schema.sql + seed.sql
│
└── README.md
```

## API Base URL

```
http://localhost/php-lms-project/backend/api
```

Configured in `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost/php-lms-project/backend/api
```

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| CORS error | Make sure `Access-Control-Allow-Origin` is set to `http://localhost:5173` in `database.php` |
| 401 Unauthorized | Token expired or missing. Login again. |
| Database connection failed | Check MySQL is running and credentials in `config/database.php` |
| Password not working | Update the password hash as shown above |
| Upload fails | Make sure `backend/uploads/` folders are writable |

## Usage Flow

1. **Admin** → Login → View stats, manage categories/courses/reviews
2. **Teacher** → Login → Create courses → Add chapters/lessons → Publish
3. **Student** → Register/Login → Browse courses → Enroll → Learn → Mark complete → Get certificate

## License

This project is for educational / college project purposes.
