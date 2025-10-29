# Frontend Connection Guide

This guide explains how to connect your frontend (React web or React Native/Expo) to the ClinicOS backend using environment variables.

## Important Notes

- **Backend `.env`** - Contains backend configuration (SMTP credentials, port, etc.)
- **Frontend `.env`** - Contains frontend configuration (backend URL, API endpoints, etc.)
- **They are separate files** - The frontend `.env` goes in your frontend project, not the backend project

---

## For React Web Apps

### Step 1: Create `.env` in Your React Project

Create a `.env` file in your React project root (where `package.json` is):

```env
# Development
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_API_BASE_URL=http://localhost:3001/api

# If deployed to production, add:
# REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
# REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
```

**Note**: React requires the `REACT_APP_` prefix for environment variables to be accessible.

### Step 2: Create Backend Config File

Create `src/config/backendConfig.ts` (or `.js`) in your React project:

```typescript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const backendConfig = {
  baseURL: BACKEND_URL,
  apiURL: API_BASE_URL,
  endpoints: {
    sendOTP: `${API_BASE_URL}/otp/send`,
    verifyOTP: `${API_BASE_URL}/otp/verify`,
    health: `${API_BASE_URL}/otp/health`,
  },
};

export default backendConfig;
```

### Step 3: Use in Your Components

```typescript
import backendConfig from './config/backendConfig';

// Send OTP
const sendOTP = async (email: string) => {
  const response = await fetch(backendConfig.endpoints.sendOTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

// Verify OTP
const verifyOTP = async (email: string, otp: string) => {
  const response = await fetch(backendConfig.endpoints.verifyOTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
};
```

### Step 4: Restart React Dev Server

After creating/updating `.env`, restart your React app:
```bash
npm start
```

---

## For React Native/Expo Apps

### Step 1: Create `.env` in Your Expo Project

Create a `.env` file in your Expo project root:

```env
# Development
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api

# For physical device testing (use your computer's IP)
# Find your IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001/api

# Production (after deploying backend)
# EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
# EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com/api
```

**Note**: Expo requires the `EXPO_PUBLIC_` prefix for environment variables.

### Step 2: Install dotenv (if not already installed)

```bash
npm install dotenv
# or
yarn add dotenv
```

### Step 3: Create Backend Config File

Create `lib/config/backendConfig.ts` (or `config/backendConfig.ts`) in your Expo project:

```typescript
import Constants from 'expo-constants';

// Get backend URL from environment variables
const BACKEND_URL = 
  process.env.EXPO_PUBLIC_BACKEND_URL || 
  Constants.expoConfig?.extra?.backendUrl || 
  'http://localhost:3001';

const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  `${BACKEND_URL}/api`;

export const BACKEND_CONFIG = {
  DEV_URL: 'http://localhost:3001',
  PROD_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://your-backend-url.onrender.com',
  CURRENT_URL: BACKEND_URL,
  API_BASE_URL: API_BASE_URL,
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
};

export const API_ENDPOINTS = {
  sendOTP: `${API_BASE_URL}/otp/send`,
  verifyOTP: `${API_BASE_URL}/otp/verify`,
  health: `${API_BASE_URL}/otp/health`,
};

export default BACKEND_CONFIG;
```

### Step 4: Use in Your Components

```typescript
import { API_ENDPOINTS } from '../config/backendConfig';

// Send OTP
const sendOTP = async (email: string) => {
  try {
    const response = await fetch(API_ENDPOINTS.sendOTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email: string, otp: string) => {
  try {
    const response = await fetch(API_ENDPOINTS.verifyOTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
```

### Step 5: Handle Network IP for Physical Devices

If testing on a physical device (not emulator):

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for "IPv4 Address" under your active network adapter
   
   # Mac/Linux
   ifconfig
   # or
   ip addr show
   ```

2. **Update `.env` with your IP:**
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001/api
   ```

3. **Make sure your backend CORS allows your IP** (already configured in `src/server.ts`)

4. **Restart Expo:**
   ```bash
   npx expo start --clear
   ```

---

## Using Different URLs for Dev/Prod

### Option 1: Use Environment Variables (Recommended)

**Development `.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:3001
# or
EXPO_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Production `.env.production`:**
```env
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
# or
EXPO_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
```

### Option 2: Conditional Logic in Config

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
// or for Expo: const isDevelopment = __DEV__;

export const BACKEND_URL = isDevelopment
  ? 'http://localhost:3001'
  : 'https://your-backend.onrender.com';
```

---

## Testing the Connection

### Test from Frontend

```typescript
// Test health endpoint
const testConnection = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log('Backend connected!', data);
    return true;
  } catch (error) {
    console.error('Backend connection failed:', error);
    return false;
  }
};
```

### Test with curl (from terminal)

```bash
# Health check
curl http://localhost:3001/health

# Send OTP (replace with your email)
curl -X POST http://localhost:3001/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Troubleshooting

### Issue: "Network request failed" or CORS errors

**Solutions:**
1. Make sure backend is running: `npm run dev` in backend directory
2. Check backend URL in frontend `.env` matches backend port (default: 3001)
3. For physical devices, use your computer's IP address, not `localhost`
4. Verify backend CORS allows your frontend origin (see `src/server.ts`)

### Issue: Environment variables not working

**For React:**
- Variables must start with `REACT_APP_`
- Restart dev server after changing `.env`
- Access via `process.env.REACT_APP_VARIABLE_NAME`

**For Expo:**
- Variables must start with `EXPO_PUBLIC_`
- Restart Expo: `npx expo start --clear`
- Access via `process.env.EXPO_PUBLIC_VARIABLE_NAME`

### Issue: Can't connect from physical device

**Solutions:**
1. Use your computer's IP address (not `localhost`)
2. Make sure phone and computer are on the same WiFi network
3. Check Windows Firewall allows connections on port 3001
4. Verify backend shows the correct IP in CORS config

---

## Quick Reference

### Backend URLs by Scenario

| Scenario | Backend URL |
|----------|-------------|
| Web app (dev) | `http://localhost:3001` |
| Expo emulator (dev) | `http://localhost:3001` |
| Expo physical device (dev) | `http://192.168.1.XXX:3001` (your computer's IP) |
| Production (deployed) | `https://your-backend.onrender.com` |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Simple health check |
| `/api/otp/send` | POST | Send OTP to email |
| `/api/otp/verify` | POST | Verify OTP code |
| `/api/otp/health` | GET | Detailed health check |

---

## Summary

1. **Backend `.env`** → Backend configuration (SMTP, port)
2. **Frontend `.env`** → Frontend configuration (backend URL)
3. **React**: Use `REACT_APP_` prefix
4. **Expo**: Use `EXPO_PUBLIC_` prefix
5. **Physical devices**: Use computer's IP address, not `localhost`
6. **Restart dev server** after changing environment variables

