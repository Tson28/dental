# Dental Clinic Management System - Architecture Document

## 1. System Overview

Hệ thống quản lý phòng khám nha khoa production-ready được xây dựng theo kiến trúc full-stack với separation of concerns rõ ràng.

## 2. Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB v6+
- **ODM**: Mongoose 7.x
- **Authentication**: JWT + Refresh Token
- **Real-time**: Socket.io 4.x
- **Validation**: Joi / Zod
- **Security**: bcrypt, helmet, cors, rate-limit

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router 6
- **Forms**: React Hook Form + Zod

## 3. Architecture Pattern

### Backend: MVC + Service Layer + Repository Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        ROUTES                                │
│                    (Express Router)                          │
├─────────────────────────────────────────────────────────────┤
│                      CONTROLLERS                              │
│                (Request/Response Logic)                      │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES                                │
│              (Business Logic Layer)                          │
├─────────────────────────────────────────────────────────────┤
│                     REPOSITORIES                              │
│               (Data Access Abstraction)                      │
├─────────────────────────────────────────────────────────────┤
│                        MODELS                                 │
│                 (Mongoose Schemas)                           │
└─────────────────────────────────────────────────────────────┘
```

### Frontend: Feature-based Architecture

```
src/
├── app/           # Store configuration
├── components/    # Shared UI components
├── features/      # Feature modules (auth, appointments, etc.)
├── hooks/         # Custom React hooks
├── layouts/       # Page layouts
├── lib/           # Utilities, axios config
├── pages/         # Route pages
└── routes/        # Route definitions
```

## 4. Security Architecture

### Authentication Flow
```
1. User Login → Validate credentials
2. Generate Access Token (15 min expiry) + Refresh Token (7 days)
3. Store Refresh Token in HTTPOnly cookie + DB
4. Return tokens to client
5. Client stores Access Token in memory (Redux)
6. Use Access Token for API requests
7. When expired → Use Refresh Token to get new pair
```

### Role-Based Access Control (RBAC)

| Role   | Permissions                                    |
|--------|------------------------------------------------|
| ADMIN  | Full system access, user management, reports   |
| DOCTOR | Manage own appointments, medical records      |
| USER   | Book appointments, view own records            |

### API Security Layers
1. Rate Limiting (100 requests/15min per IP)
2. Helmet.js (security headers)
3. CORS (whitelist origins)
4. Input Validation (Zod schemas)
5. Password Hashing (bcrypt 12 rounds)

## 5. Database Schema Design

### Users Collection
- User authentication data
- Role assignment
- Profile information

### Appointments Collection
- Schedule management
- Status tracking

### Patients Collection
- Patient personal information (name, DOB, gender, phone, email, address)
- Emergency contact details
- Insurance information
- Medical tags (VIP, urgent, pediatric, etc.)
- Uploaded documents (X-rays, lab results, prescriptions)
- Soft delete support

### Medical Records Collection
- Patient history
- Treatment notes

### Services Collection
- Dental services catalog
- Pricing

## 6. API Design

### RESTful Endpoints

| Method | Endpoint                           | Description              | Auth Required | Roles           |
|--------|------------------------------------|-------------------------|---------------|-----------------|
| POST   | /api/auth/register                 | Register new user       | No            | -               |
| POST   | /api/auth/login                    | User login              | No            | -               |
| POST   | /api/auth/refresh                  | Refresh tokens          | No            | -               |
| POST   | /api/auth/logout                   | Logout user             | Yes           | All             |
| GET    | /api/users                         | List all users          | Yes           | ADMIN           |
| GET    | /api/users/:id                     | Get user by ID          | Yes           | ADMIN           |
| PUT    | /api/users/:id                     | Update user             | Yes           | ADMIN           |
| DELETE | /api/users/:id                     | Delete user             | Yes           | ADMIN           |
| GET    | /api/patients                      | List patients          | Yes           | All             |
| POST   | /api/patients                      | Create patient         | Yes           | All             |
| GET    | /api/patients/:id                  | Get patient detail     | Yes           | All             |
| PUT    | /api/patients/:id                  | Update patient         | Yes           | All             |
| DELETE | /api/patients/:id                  | Soft-delete patient    | Yes           | ADMIN,DOCTOR    |
| PATCH  | /api/patients/:id/restore          | Restore patient        | Yes           | ADMIN           |
| POST   | /api/patients/:id/documents         | Add document           | Yes           | ADMIN,DOCTOR    |
| DELETE | /api/patients/:id/documents/:docId  | Remove document         | Yes           | ADMIN,DOCTOR    |
| POST   | /api/patients/:id/tags             | Add patient tag        | Yes           | ADMIN,DOCTOR    |
| DELETE | /api/patients/:id/tags/:tagName     | Remove patient tag     | Yes           | ADMIN,DOCTOR    |
| GET    | /api/patients/:id/medical-history  | Get medical history   | Yes           | All             |
| GET    | /api/patients/stats                | Get patient stats      | Yes           | ADMIN,DOCTOR    |
| GET    | /api/appointments                  | List appointments      | Yes           | All             |
| POST   | /api/appointments                  | Create appointment     | Yes           | USER,ADMIN      |
| PUT    | /api/appointments/:id              | Update appointment     | Yes           | DOCTOR,ADMIN    |
| DELETE | /api/appointments/:id              | Cancel appointment     | Yes           | All             |

## 7. Project Structure

```
dental/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, env configs
│   │   ├── controllers/    # Request handlers (Auth, User, Appointment, Patient)
│   │   ├── middleware/      # Auth, validation, error
│   │   ├── models/          # Mongoose schemas (User, Appointment, MedicalRecord, Service, Patient)
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers, Zod schemas
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Redux store
│   │   ├── components/       # UI components (shadcn/ui)
│   │   ├── features/         # Redux slices (auth, patients)
│   │   ├── hooks/            # Custom hooks
│   │   ├── layouts/          # Page layouts
│   │   ├── lib/              # Utils, axios
│   │   ├── pages/            # Route pages (auth, dashboard, appointments, patients, users)
│   │   ├── routes/            # Router config
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── SPEC.md
└── README.md
```

## 8. Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dental_clinic
JWT_ACCESS_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Dental Clinic
```

## 9. Deployment Considerations

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT secrets (256-bit)
- [ ] Configure HTTPS
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Configure CORS whitelist
- [ ] Enable compression
- [ ] Setup monitoring/logging
- [ ] Configure backup strategy
- [ ] Setup CI/CD pipeline
