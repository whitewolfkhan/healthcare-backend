# Healthcare Backend

A robust REST API backend for a healthcare management system built with Node.js and Express.js, providing comprehensive healthcare services with role-based access control.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access (Admin, Doctor, Patient)
- **User Management**: Registration, login, password reset, Google OAuth integration
- **Patient Management**: Complete patient profiles, medical history, and records
- **Doctor Management**: Doctor profiles, specializations, and department assignments
- **Appointment System**: Schedule, manage, and track appointments
- **Medical Records**: Store and retrieve patient medical history, prescriptions, lab results
- **Medication Management**: Track medications, prescriptions, and dosages
- **Lab Results**: Upload and manage laboratory test results
- **Medical Imaging**: Handle medical image uploads and storage
- **Vital Signs**: Record and monitor patient vital signs
- **Notifications**: Send email notifications for appointments and updates
- **File Upload**: Secure file upload handling for documents and images
- **Audit Logging**: Comprehensive logging with Winston
- **Rate Limiting**: API rate limiting for security
- **Data Validation**: Input validation with express-validator

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Logging**: Winston
- **HTTP Logging**: Morgan
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator
- **Google Auth**: Google Auth Library
- **Compression**: gzip compression
- **Development**: Nodemon

## Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <backend-repo-url>
   cd healthcare-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=healthcare_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## Database Setup

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE healthcare_db;
   ```

2. Run database migrations (if using migrations) or seed the database:
   ```bash
   npm run seed
   ```

## Development

Start the development server with auto-reload:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## Production

Start the production server:
```bash
npm start
```

## Docker

Build and run with Docker:
```bash
docker build -t healthcare-backend .
docker run -p 5000:5000 --env-file .env healthcare-backend
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `DB_HOST` | PostgreSQL host | No | `localhost` |
| `DB_PORT` | PostgreSQL port | No | `5432` |
| `DB_NAME` | Database name | No | `healthcare_db` |
| `DB_USER` | Database user | No | `postgres` |
| `DB_PASSWORD` | Database password | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | No | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | No | - |
| `EMAIL_HOST` | SMTP host | No | - |
| `EMAIL_PORT` | SMTP port | No | `587` |
| `EMAIL_USER` | SMTP username | No | - |
| `EMAIL_PASS` | SMTP password | No | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No | - |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/google` - Google OAuth login

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Patients
- `GET /api/patients` - Get patients
- `POST /api/patients` - Create patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient

### Doctors
- `GET /api/doctors` - Get doctors
- `POST /api/doctors` - Create doctor
- `GET /api/doctors/:id` - Get doctor details
- `PUT /api/doctors/:id` - Update doctor

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/medical-records` - Get medical records
- `POST /api/medical-records` - Create medical record
- `PUT /api/medical-records/:id` - Update record

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription

### Lab Results
- `GET /api/lab-results` - Get lab results
- `POST /api/lab-results` - Upload lab result

### Medical Images
- `GET /api/medical-images` - Get medical images
- `POST /api/medical-images` - Upload medical image

### Medications
- `GET /api/medications` - Get medications
- `POST /api/medications` - Add medication

### Vital Signs
- `GET /api/vitals` - Get vital signs
- `POST /api/vitals` - Record vital signs

### Departments
- `GET /api/departments` - Get departments
- `POST /api/departments` - Create department

### Admin
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Manage users

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Send notification

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/             # Route controllers
│   ├── middleware/              # Express middleware
│   │   ├── auth.js             # Authentication middleware
│   │   └── upload.js           # File upload middleware
│   ├── models/                 # Sequelize models
│   ├── routes/                 # API routes
│   └── utils/                  # Utility functions
│       ├── email.js            # Email service
│       ├── logger.js           # Logging utility
│       └── seed.js             # Database seeding
├── uploads/                    # File uploads directory
│   ├── avatars/                # User avatars
│   ├── documents/              # Medical documents
│   └── medical-images/         # Medical images
├── logs/                       # Application logs
├── Dockerfile                  # Docker configuration
├── package.json                # Dependencies and scripts
└── server.js                   # Application entry point
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with initial data

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Request data validation
- **Password Hashing**: Secure password storage
- **JWT Authentication**: Secure token-based authentication
- **File Upload Security**: Secure file handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

