# Dental Clinic Management System

Hệ thống quản lý phòng khám nha khoa production-ready được xây dựng với React + Node.js.

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB v6+
- **Authentication**: JWT + Refresh Token
- **Validation**: Zod
- **Security**: bcrypt, helmet, cors, rate-limit

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router 6

## Architecture

### Backend: MVC + Service Layer + Repository Pattern

```
backend/
├── src/
│   ├── config/          # Database, environment configs
│   ├── controllers/    # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── utils/           # Helpers, JWT
│   └── index.js         # Entry point
```

### Frontend: Feature-based Architecture

```
frontend/
├── src/
│   ├── app/             # Redux store
│   ├── components/       # UI components
│   ├── features/         # Redux slices
│   ├── layouts/          # Page layouts
│   ├── lib/              # Utils, axios config
│   ├── pages/            # Route pages
│   ├── routes/           # Router config
│   └── main.jsx          # Entry point
```

## Roles

| Role   | Permissions                                    |
|--------|------------------------------------------------|
| ADMIN  | Full system access, user management, reports   |
| DOCTOR | Manage own appointments, medical records      |
| USER   | Book appointments, view own records            |

## Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dental_clinic
JWT_ACCESS_SECRET=your-32-char-min-secret
JWT_REFRESH_SECRET=your-32-char-min-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Dental Clinic
```

## API Endpoints

### Authentication

| Method | Endpoint            | Description           | Auth |
|--------|--------------------|-----------------------|------|
| POST   | /api/auth/register  | Register new user     | No   |
| POST   | /api/auth/login    | User login            | No   |
| POST   | /api/auth/refresh  | Refresh tokens        | No   |
| POST   | /api/auth/logout   | Logout                | Yes  |
| GET    | /api/auth/profile  | Get profile           | Yes  |
| PUT    | /api/auth/profile  | Update profile        | Yes  |
| PUT    | /api/auth/password | Change password       | Yes  |

### Users (Admin only)

| Method | Endpoint            | Description           |
|--------|--------------------|-----------------------|
| GET    | /api/users         | List users            |
| GET    | /api/users/:id     | Get user by ID        |
| PUT    | /api/users/:id     | Update user           |
| DELETE | /api/users/:id     | Delete user           |

### Appointments

| Method | Endpoint                      | Description           | Auth |
|--------|-------------------------------|-----------------------|------|
| GET    | /api/appointments             | List appointments     | Yes  |
| GET    | /api/appointments/:id         | Get appointment       | Yes  |
| POST   | /api/appointments             | Create appointment    | Yes  |
| PUT    | /api/appointments/:id         | Update appointment    | Yes  |
| PATCH  | /api/appointments/:id/cancel  | Cancel appointment    | Yes  |

## Development

```bash
# Backend
cd backend
npm run dev        # Development mode
npm start          # Production mode

# Frontend
cd frontend
npm run dev        # Development mode
npm run build      # Production build
npm run preview    # Preview production build
```

## Testing Checklist

### Backend Testing

- [ ] MongoDB connection successful
- [ ] Health check endpoint working
- [ ] User registration with validation
- [ ] User login with JWT generation
- [ ] Token refresh mechanism
- [ ] Protected route access control
- [ ] Role-based authorization
- [ ] Input validation errors
- [ ] Rate limiting working
- [ ] Error handling responses

### Frontend Testing

- [ ] Login page loads correctly
- [ ] Register page loads correctly
- [ ] Login form submission
- [ ] Registration form submission
- [ ] Protected route redirect
- [ ] Dashboard loads after login
- [ ] User menu dropdown works
- [ ] Logout functionality
- [ ] Profile page loads
- [ ] Appointments page loads (Admin/Doctor/User)
- [ ] Users page loads (Admin only)

### Security Testing

- [ ] JWT token validation
- [ ] Refresh token rotation
- [ ] CORS configuration
- [ ] Helmet security headers
- [ ] Rate limiting protection
- [ ] Password hashing
- [ ] SQL injection prevention
- [ ] XSS protection

## Project Structure

```
dental/
├── SPEC.md                    # Architecture documentation
├── README.md                  # This file
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── README.md
│   └── src/
│       ├── index.js
│       ├── config/
│       │   ├── index.js
│       │   └── database.js
│       ├── controllers/
│       │   ├── index.js
│       │   ├── AuthController.js
│       │   ├── UserController.js
│       │   └── AppointmentController.js
│       ├── middleware/
│       │   ├── index.js
│       │   ├── errors/
│       │   ├── validation/
│       │   └── auth/
│       ├── models/
│       │   ├── index.js
│       │   ├── User.js
│       │   ├── Appointment.js
│       │   ├── MedicalRecord.js
│       │   └── Service.js
│       ├── repositories/
│       │   ├── index.js
│       │   ├── UserRepository.js
│       │   ├── AppointmentRepository.js
│       │   ├── MedicalRecordRepository.js
│       │   └── ServiceRepository.js
│       ├── routes/
│       │   ├── index.js
│       │   ├── authRoutes.js
│       │   ├── userRoutes.js
│       │   └── appointmentRoutes.js
│       ├── services/
│       │   ├── index.js
│       │   ├── AuthService.js
│       │   ├── UserService.js
│       │   └── AppointmentService.js
│       └── utils/
│           ├── index.js
│           ├── validationSchemas.js
│           ├── jwt.js
│           └── responseHelper.js
│
└── frontend/
    ├── package.json
    ├── .env
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── app/
        │   └── store.js
        ├── components/
        │   └── ui/
        │       ├── button.jsx
        │       ├── input.jsx
        │       ├── label.jsx
        │       ├── card.jsx
        │       ├── badge.jsx
        │       ├── table.jsx
        │       ├── avatar.jsx
        │       ├── tabs.jsx
        │       ├── dialog.jsx
        │       ├── dropdown-menu.jsx
        │       ├── separator.jsx
        │       ├── toast.jsx
        │       ├── toaster.jsx
        │       ├── use-toast.js
        │       └── select.jsx
        ├── features/
        │   ├── auth/
        │   │   └── authSlice.js
        │   └── ui/
        │       └── uiSlice.js
        ├── layouts/
        │   ├── MainLayout.jsx
        │   └── DashboardLayout.jsx
        ├── lib/
        │   ├── api.js
        │   └── utils.js
        ├── pages/
        │   ├── auth/
        │   │   ├── LoginPage.jsx
        │   │   └── RegisterPage.jsx
        │   ├── dashboard/
        │   │   └── DashboardPage.jsx
        │   ├── appointments/
        │   │   └── AppointmentsPage.jsx
        │   ├── users/
        │   │   └── UsersPage.jsx
        │   ├── profile/
        │   │   └── ProfilePage.jsx
        │   └── NotFoundPage.jsx
        └── routes/
            ├── ProtectedRoute.jsx
            └── PublicRoute.jsx
```

## License

ISC
