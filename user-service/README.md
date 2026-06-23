User Service

The User Service is responsible for user registration, authentication, authorization, and profile management within the KFinFund platform.

Features Implemented

User Registration

Endpoint

POST /api/users/register

Functionality

* Registers new users
* Stores user details in PostgreSQL
* Hashes passwords using bcrypt before storage
* Prevents duplicate email registrations

⸻

User Login

Endpoint

POST /api/users/login

Functionality

* Authenticates users using email and password
* Verifies hashed passwords using bcrypt
* Generates JWT authentication tokens
* Returns JWT token upon successful login

⸻

JWT Authentication Middleware

Functionality

* Verifies JWT tokens
* Protects secured routes
* Extracts authenticated user information
* Denies unauthorized access

⸻

User Profile

Endpoint

GET /api/users/profile

Functionality

* Returns authenticated user profile details
* Accessible only with a valid JWT token

⸻

Update Profile

Endpoint

PUT /api/users/profile

Functionality

* Updates authenticated user’s profile information
* Allows modification of:
    * Full Name
    * Phone Number

⸻

Change Password

Endpoint

PUT /api/users/change-password

Functionality

* Verifies current password
* Hashes new password using bcrypt
* Updates password securely in PostgreSQL

⸻

Database

PostgreSQL

Database: kfinfund

Users Table

Column	Type
id	SERIAL PRIMARY KEY
full_name	VARCHAR(100)
email	VARCHAR(100) UNIQUE
password	VARCHAR(255)
phone	VARCHAR(15)
created_at	TIMESTAMP

⸻

Tech Stack

* Node.js
* Express.js
* PostgreSQL
* bcryptjs
* JSON Web Token (JWT)
* dotenv
* cors
* nodemon

⸻

API Endpoints

Register User

POST /api/users/register

Login User

POST /api/users/login

Get Profile

GET /api/users/profile

Update Profile

PUT /api/users/profile

Change Password

PUT /api/users/change-password

⸻

Authentication

Protected endpoints require JWT authentication.

Example:

Authorization Header:

Authorization: Bearer <JWT_TOKEN>

⸻

Project Structure

user-service/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   └── userModel.js
│   │
│   ├── routes/
│   │   └── userRoutes.js
│   │
│   └── app.js
│
├── .env
├── .env.example
├── init.sql
├── package.json
├── package-lock.json
└── README.md
⸻

Completed Tasks

* PostgreSQL integration
* User Registration API
* Password hashing using bcrypt
* Duplicate email validation
* User Login API
* JWT token generation
* JWT authentication middleware
* User Profile API
* Update Profile API
* Change Password API
* API testing using Postman

⸻

Status

User Service implementation completed and integrated with PostgreSQL authentication workflow.
