User Service

The User Service is responsible for user registration, authentication, and user management within the KFinFund platform.

Features Implemented

User Registration

Endpoint.

POST /api/users/register

Functionality

- Registers new users
- Stores user details in PostgreSQL
- Hashes passwords using bcrypt before storage
- Prevents duplicate email registrations

User Login

Endpoint

POST /api/users/login

Functionality

- Authenticates users using email and password
- Verifies hashed passwords using bcrypt
- Generates JWT authentication tokens
- Returns JWT token upon successful login

Database

PostgreSQL

Database: "kfinfund"

Users Table

id - SERIAL PRIMARY KEY
full_name - VARCHAR(100)
email - VARCHAR(100) UNIQUE
password - VARCHAR(255)
phone - VARCHAR(15)
created_at - TIMESTAMP

Tech Stack

- Node.js
- Express.js
- PostgreSQL
- bcryptjs
- JSON Web Token (JWT)
- dotenv
- cors

Current API Endpoints

Register User

POST "/api/users/register"

Request:

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}

Login User

POST "/api/users/login"

Request:

{
  "email": "john@example.com",
  "password": "password123"
}

Response:

{
  "message": "Login successful",
  "token": "JWT_TOKEN"
}

Completed Tasks

- Project setup
- PostgreSQL integration
- User registration API
- Password hashing
- Duplicate email validation
- User login API
- JWT token generation
- API testing using Postman

Pending Tasks

- JWT authentication middleware
- User profile API
- Update profile API
- Change password API
- Password reset functionality
- Role-based authorization
