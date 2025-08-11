# EngageX Development Setup

## Problem Solved

The issue was that your frontend was trying to access routes like `/login`, `/`, etc. directly on the backend server (port 3000), but the backend only serves API routes. This caused 404 errors.

## Solution

1. **Backend** runs on port 3000 and serves API routes only
2. **Frontend** runs on port 3001 and serves the React app
3. **API calls** from frontend to backend are properly configured

## Quick Start

### Option 1: Use the batch script (Windows)

```bash
# Double-click or run:
start-dev.bat
```

### Option 2: Manual setup

```bash
# Terminal 1 - Start Backend
cd Backend
npm run dev

# Terminal 2 - Start Frontend
cd Frontend
npm start
```

## What was fixed

### 1. Added proxy configuration to Frontend/package.json

```json
{
  "proxy": "http://localhost:3000"
}
```

### 2. Updated API calls in components

- `login.tsx`: Now calls `http://localhost:3000/api/auth/login`
- `signup.tsx`: Now calls `http://localhost:3000/api/auth/register`

### 3. Created development startup script

- `start-dev.bat`: Automatically starts both servers

## Access URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api/health
- **Login Page**: http://localhost:3001/login
- **Signup Page**: http://localhost:3001/signup

## Why Postman worked but browser didn't

- **Postman**: Directly called the API endpoint `http://localhost:3000/api/auth/login` ✅
- **Browser**: Tried to access frontend routes on backend server ❌

Now both will work correctly!
