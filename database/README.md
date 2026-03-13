# Freelancer Login Backend Setup

## Prerequisites
1. PostgreSQL installed on your system
2. Node.js installed (v14 or higher)

## Setup Instructions

### 1. Install PostgreSQL
Download from: https://www.postgresql.org/download/windows/

### 2. Create Database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE freelancer_login;
```

### 3. Run Database Setup Script
In pgAdmin or psql, connect to the `freelancer_login` database and execute the `setup.sql` file.

Or from command line:
```bash
psql -U postgres -d freelancer_login -f setup.sql
```

### 4. Install Node.js Dependencies
Navigate to the database folder and run:
```bash
cd database
npm install
```

### 5. Configure Database Connection
Edit `server.js` and update the PostgreSQL connection settings:
```javascript
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'freelancer_login',
    password: 'your_password', // Change this!
    port: 5432,
});
```

### 6. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

Server will run on: http://localhost:3000

## API Endpoints

### Register User
**POST** `/api/register`
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
**POST** `/api/login`
```json
{
  "emailOrUsername": "john@example.com",
  "password": "password123"
}
```

### Get User
**GET** `/api/users/:id`

## Database Schema

### users table
- `id` - Serial primary key
- `username` - Unique username (max 50 chars)
- `email` - Unique email (max 100 chars)
- `password_hash` - Hashed password (bcrypt)
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp
- `is_active` - Account status (boolean)

## Security Features
- Passwords are hashed using bcrypt (10 salt rounds)
- SQL injection protection using parameterized queries
- CORS enabled for frontend integration
- Input validation on all endpoints

## Testing with Postman or cURL

### Register:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Login:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"emailOrUsername\":\"test@example.com\",\"password\":\"password123\"}"
```
