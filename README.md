# OpportuNest Internship Management System

A full-stack internship management platform for coordinating students, supervisors, companies, and admins in one workflow.

## Overview
This project provides end-to-end internship lifecycle management:
- Student registration, profile management, and job applications
- Company onboarding, job posting, and candidate management
- Supervisor assignment, progress tracking, and evaluations
- Admin governance for approvals, users, settings, and reports
- Document workflows: CVs, offer letters, joining reports, weekly reports, internship reports, certificates
- Email notifications for verification, reset password, interview updates, and evaluation updates

## Repository Structure
```text
.
|-- Frontend/   # React + Vite client
|-- Backend/    # Node.js + Express + MongoDB API
```

## Tech Stack
- Frontend: React 18, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express, Mongoose, JWT, Nodemailer, Multer
- Database: MongoDB
- Auth: JWT-based role access

## Main Roles
- Student
- Company
- Supervisor
- Admin

## Prerequisites
- Node.js 18+ (recommended)
- npm 9+
- MongoDB (Atlas or local)
- Gmail App Password (for email service in current backend setup)

## Environment Setup

### 1) Backend environment (`Backend/.env`)
Create `Backend/.env` with:

```env
PORT=5005
MONGO_URI=mongodb://127.0.0.1:27017/internship-portal
JWT_SECRET=replace_with_secure_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM_NAME=COMSATS Internship Portal

FRONTEND_URL=http://localhost:5173
```

Notes:
- `PORT=5005` is recommended because frontend defaults to `http://localhost:5005/api`.
- Server startup verifies email connection. Invalid email credentials can prevent startup.

### 2) Frontend environment (`Frontend/.env`)
Create or update `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5005/api
VITE_APP_NAME="COMSATS Internship Portal - Admin"
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
VITE_DEBUG_MODE=true
VITE_APP_ENV=development
```

## Installation
Run from repository root in two steps:

### Install backend dependencies
```powershell
cd Backend
npm install
```

### Install frontend dependencies
```powershell
cd ..\Frontend
npm install
```

## Run the Project
Use two terminals.

### Terminal 1: Start backend
```powershell
cd Backend
npm run dev
```
Backend runs on: `http://localhost:5005` (if `PORT=5005`)
Health check: `http://localhost:5005/health`

### Terminal 2: Start frontend
```powershell
cd Frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

## Optional: Seed Initial Data

### Create admin user and default settings/domains
```powershell
cd Backend
node scripts/seedAdmin.js
```

### Seed sample companies and jobs
```powershell
cd Backend
node scripts/runSeeding.js
```

## Scripts Reference

### Frontend (`Frontend/package.json`)
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint project

### Backend (`Backend/package.json`)
- `npm run dev` - start with nodemon
- `npm start` - start with node

## API Routing Base
Backend route prefix is `/api`, for example:
- `/api/auth`
- `/api/jobs`
- `/api/applications`
- `/api/students`
- `/api/supervisors`
- `/api/admin`
- `/api/weekly-reports`
- `/api/internship-reports`

## YouTube Demo
Add your demo link here:

```text
[YouTube Demo Placeholder]
https://youtu.be/z3M6ulwU0Oc?si=F95VojOSL5kJ6FyZ
```

## Troubleshooting
- `Error: remote origin already exists`:
  - Remote is already configured. Use `git remote -v` to verify.
- Frontend cannot connect to backend:
  - Ensure backend is running and `VITE_API_BASE_URL` matches backend port.
- MongoDB connection errors:
  - Verify `MONGO_URI` and Atlas network access/IP whitelist.
- Email startup failure:
  - Verify `EMAIL_USER` and `EMAIL_PASS` (Gmail App Password).
- CORS issues:
  - Run frontend on localhost Vite port and backend on configured API port.

## Security Notes
- Do not commit real `.env` files.
- Rotate leaked credentials immediately.
- Use strong values for `JWT_SECRET` in production.

## License
Set your preferred license in this section.
