# Oracle Frontend

Oracle's frontend is a React + TypeScript interface for strategy design, backtesting, and bot control.

## Style Guide

- Typography: Space Grotesk (display), IBM Plex Mono (accent)
- Primary color: ember `#f36b3f`
- Surfaces: glass-card on `oracle-gradient` backgrounds
- Layout: generous spacing, rounded panels, uppercase micro-labels

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment

Create a `.env` if you need overrides:

```bash
VITE_API_BASE=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=60446126210-511ovq2agv2ea6en4g8hf2gqc73k9412.apps.googleusercontent.com
```

## Auth Flow

- Email/password login uses `/auth/login`
- Registration uses `/auth/register` followed by `/auth/login`
- Google OAuth uses `/auth/google/authorize` and redirects to `/auth/callback`
