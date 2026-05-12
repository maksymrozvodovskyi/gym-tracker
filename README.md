# GymTracker

Full-stack MERN web app for workout planning, logging and analytics.

## Features
- JWT auth (register/login/logout, refresh tokens)
- User profile (weight, height, goals)
- Exercise catalog CRUD (admin)
- Workout templates
- Session logging with PR auto-detection
- Analytics: volume, charts (Recharts), records
- Admin panel + stats
- Fully responsive (Tailwind)

## Stack
- Frontend: Vite + React 19 + React Router + Tailwind + Recharts + Axios
- Backend: Express + MongoDB (Mongoose) + JWT + bcrypt
- Deploy: Vercel (frontend) + separate backend host (Railway/Render)

## Quick Start

### 1. Backend
```bash
cd server
cp .env.example .env
# Edit MONGODB_URI and JWT secrets
npm install
npm run dev
```

### 2. Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

## Production (Vercel)
- Frontend: `npm run build` in client → deploy `/client` folder to Vercel
- Backend: Deploy `server` to Railway / Render / Fly.io (set env vars)
- MongoDB: Atlas (free tier)
- Set `VITE_API_URL` in Vercel to your backend URL

## API Prefix
All endpoints under `/api/v1`

## Team
PM: Dmytro Lutsyk | Lead: Maksym Rozvodovskyi | Sponsor: Vitaliy Dorosh (WUNU)

Deadline: 19.06.2026

## License
MIT
