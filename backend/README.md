# Dental Clinic Management System - Backend

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/dental_clinic |
| JWT_ACCESS_SECRET | Access token secret | - |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_ACCESS_EXPIRY | Access token expiry | 15m |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 7d |
| CLIENT_URL | Frontend URL | http://localhost:5173 |

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | User login | No |
| POST | /api/auth/refresh | Refresh tokens | No |
| POST | /api/auth/logout | Logout | Yes |
| GET | /api/auth/profile | Get profile | Yes |
| PUT | /api/auth/profile | Update profile | Yes |
| PUT | /api/auth/password | Change password | Yes |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users |
| GET | /api/users/:id | Get user by ID |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| PATCH | /api/users/:id/status | Toggle status |

### Appointments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/appointments | List appointments | Yes |
| GET | /api/appointments/:id | Get appointment | Yes |
| POST | /api/appointments | Create appointment | Yes |
| PUT | /api/appointments/:id | Update appointment | Yes |
| PATCH | /api/appointments/:id/cancel | Cancel appointment | Yes |
| PATCH | /api/appointments/:id/status | Update status | Doctor/Admin |

## Roles

- **ADMIN**: Full access
- **DOCTOR**: Manage own appointments, medical records
- **USER**: Book appointments, view own records
