# Code Clash

Code Clash is a full-stack coding practice and contest platform. Users can learn DSA topics, solve problems, run code against test cases, and compete in coding clashes.

## Features

- DSA learning roadmap with LeetCode and GFG practice links
- Coding workspace with problem statement, editor, and test results
- Multi-language code execution through Judge0
- AI hints and topic explanations through Gemini
- Supabase login and realtime Clash data
- Clash rooms, invite links, leaderboards, match history, and replay summaries
- Contest hosting and contest problem pages

## Tools Used

- React.js
- Tailwind CSS
- Django
- Django REST Framework
- Supabase
- Judge0 API
- Gemini API
- SQLite

## Project Structure

```text
CodeClash_2.o/
+-- client/        # React frontend
+-- Server/        # Django backend
+-- supabase/      # Supabase schema
```

## Frontend Setup

```bash
cd client
npm install
npm start
```

Create `client/.env`:

```env
REACT_APP_DJANGO_API_BASE_URL=http://127.0.0.1:8000
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Backend Setup

```bash
cd Server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Create `Server/.env`:

```env
django_key=your_django_secret_key
DEBUG=True
gemini_api_key=your_gemini_api_key
JUDGE0_BASE_URL=https://ce.judge0.com/
```

## Supabase Setup

Run `supabase/schema.sql` in the Supabase SQL editor, then enable authentication and realtime for the Clash tables.

