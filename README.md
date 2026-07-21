# Code Clash

Code Clash is a full-stack coding practice and competitive programming platform where users can learn DSA, solve coding problems, execute code, collaborate in real time, and participate in coding clashes.

The application uses:

- React.js frontend deployed on Vercel
- Django REST API backend deployed on Render
- Supabase for authentication, PostgreSQL database, and realtime features

---

# Features

## DSA Learning

- Structured DSA roadmap
- LeetCode practice links
- GeeksForGeeks practice resources

## Coding Workspace

- Problem descriptions
- Code editor
- Multi-language code execution
- Test case evaluation
- Judge0 API integration

## AI Assistance

- AI-powered coding hints
- Gemini API integration

## Code Clash Battles

- Real-time clash rooms
- Invite-based coding battles
- Contest creation and participation
- Leaderboards
- Match history
- Replay summaries

## Authentication

- Supabase authentication
- Email/password login
- Secure user sessions

## User Interface

- Responsive React UI
- Tailwind CSS styling

---

# Tech Stack

## Frontend

- React.js
- Tailwind CSS
- React Router
- Axios

## Backend

- Python
- Django
- Django REST Framework
- Gunicorn

## Database and Services

- Supabase Authentication
- Supabase PostgreSQL
- Supabase Realtime
- Judge0 API
- Google Gemini API

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database and Authentication | Supabase |

---

# Project Structure
CodeClash/
│
├── client/                  # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env
│
├── Server/                  # Django backend
│   ├── App/
│   ├── api/
│   ├── server/
│   ├── requirements.txt
│   ├── manage.py
│   └── .env
│
└── supabase/
    └── schema.sql

# Local Development Setup

## Clone Repository

```bash
git clone https://github.com/nikhileswar-ambati/code_clash.git

cd code_clash
## Frontend Setup (React)

### Move into client folder

```bash
cd client
```

### Install dependencies

```bash
npm install
```

### Create `.env` file inside the `client` folder

```env
REACT_APP_DJANGO_API_BASE_URL=http://127.0.0.1:8000

REACT_APP_SUPABASE_URL=https://your-project.supabase.co

REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run frontend

```bash
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

# Backend Setup (Django)

Open another terminal:

```bash
cd Server
```

## Create virtual environment

```bash
python -m venv venv
```

## Activate virtual environment

### Windows

```bash
venv\Scripts\activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

## Create `.env` file

```env
django_key=your_django_secret_key

DEBUG=True

gemini_api_key=your_gemini_api_key

JUDGE0_BASE_URL=https://ce.judge0.com/
```

## Run migrations

```bash
python manage.py migrate
```

## Start backend

```bash
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

# Supabase Setup

1. Create a Supabase project.

2. Copy:

- Project URL
- Anon Public Key

3. Add them to the frontend `.env` file.

4. Open Supabase SQL Editor.

5. Run:

```sql
supabase/schema.sql
```

6. Enable:

- Authentication
- Email/password login
- Realtime for required tables

---

# Production Deployment

## Frontend Deployment (Vercel)

The React application is deployed using Vercel.

## Vercel Configuration

### Root Directory

```
client
```

### Framework

```
Create React App
```

### Build Command

```bash
npm run build
```

### Output Directory

```
build
```

---

## Vercel Environment Variables

Add environment variables in:

```
Vercel Dashboard
→ Project Settings
→ Environment Variables
```

Production variables:

```env
REACT_APP_DJANGO_API_BASE_URL=https://your-render-backend-url.onrender.com

REACT_APP_SUPABASE_URL=https://your-project.supabase.co

REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

After changing environment variables, redeploy the project.

---

# Backend Deployment (Render)

Backend is deployed as a Django Web Service.

## Render Settings

### Root Directory

```
Server
```

### Build Command

```bash
pip install -r requirements.txt && python manage.py migrate
```

### Start Command

```bash
gunicorn server.wsgi
```

---

## Render Environment Variables

Add:

```env
django_key=your_secret_key

DEBUG=False

gemini_api_key=your_gemini_key

JUDGE0_BASE_URL=https://ce.judge0.com/
```

---

# Connecting Vercel Frontend With Render Backend

Update frontend environment variable:

```env
REACT_APP_DJANGO_API_BASE_URL=https://your-render-app.onrender.com
```

Do not use:

```text
http://127.0.0.1:8000
```

in production.

---

# Supabase Authentication Configuration

In Supabase Dashboard:

```
Authentication
→ URL Configuration
```

Set:

## Site URL

```
https://your-vercel-domain.vercel.app
```

## Redirect URLs

```
https://your-vercel-domain.vercel.app/*
```

Example:

```
https://code-clash-mocha-six.vercel.app/*
```

---

# Common Production Fixes

## 1. Supabase Auth 404 Error

### Wrong

```
https://project.supabase.co/rest/v1/auth/v1/signup
```

### Correct

```
https://project.supabase.co/auth/v1/signup
```

Make sure your Supabase client is configured correctly:

```javascript
createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)
```

Do not append:

```
/rest/v1/
```

to the Supabase URL.

---

## 2. Vercel Blank Page Fix

If using React Router, create:

```
client/vercel.json
```

Add:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Manifest Icon Warning Fix

Update:

```
client/public/manifest.json
```

Replace old CRA icons:

```json
"icons": [
  {
    "src": "faviconBG.png",
    "sizes": "512x512",
    "type": "image/png"
  }
]
```

---

# Environment Summary

| Service | Purpose |
|---------|---------|
| Vercel | React frontend deployment and environment variables |
| Render | Django backend deployment and environment variables |
| Supabase | Authentication, PostgreSQL database, and realtime features |
| Judge0 | Code execution API |
| Gemini | AI coding hints |

---

# Future Improvements

- PostgreSQL migration for production database
- Docker deployment
- Better monitoring and logging
- Support for more programming languages
- Anti-cheat mechanisms for contests
- Advanced ranking system