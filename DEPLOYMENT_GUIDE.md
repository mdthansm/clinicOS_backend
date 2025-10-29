# Backend Deployment Guide

## Problem
Your local backend is working in development but not accessible from other devices or in production builds because it's running on a local IP which is not accessible from outside your network.

## Solution
Deploy your backend to a public hosting service so it's accessible from anywhere.

## Option 1: Deploy to Render (Recommended - Free)

### Step 1: Push Backend to GitHub
```bash
git init
git add .
git commit -m "Initial backend commit"
git remote add origin your-github-repo-url
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `clinic-os-backend`
   - **Environment**: `Node`
   - **Build Command**: `yarn install` (or `npm install` - build runs automatically via postinstall script)
   - **Start Command**: `npm start` (or `yarn start`)
   - **Port**: `3001` (or your configured port)

5. **IMPORTANT: Add Environment Variables BEFORE creating the service:**
   
   **OR if service already exists:**
   - Go to your service dashboard
   - Click on "Environment" in the left sidebar
   - Click "Add Environment Variable" for each variable
   
   **Required Environment Variables:**
   - **Key**: `SMTP_EMAIL` → **Value**: `your-email@gmail.com`
   - **Key**: `SMTP_APP_PASSWORD` → **Value**: `your-16-char-app-password`
   - **Key**: `NODE_ENV` → **Value**: `production`
   - **Key**: `PORT` → **Value**: Leave empty (Render sets this automatically) or `10000`
   
   **⚠️ CRITICAL TIPS:**
   - No spaces around the `=` sign in Render
   - No quotes needed around values
   - Case-sensitive: Use exactly `SMTP_EMAIL` and `SMTP_APP_PASSWORD`
   - After adding/updating environment variables, you MUST manually trigger a redeploy
   - Click "Save Changes" after adding each variable

6. Click "Create Web Service" (or "Save Changes" if updating)
7. **Manually trigger redeploy** (if you added env vars after creation):
   - Go to "Manual Deploy" → "Deploy latest commit"
8. Wait for deployment (about 5-10 minutes)
9. Copy your service URL (e.g., `https://clinic-os-backend.onrender.com`)

### Step 3: Update Frontend Config

Update your frontend/mobile app's backend configuration file:

```typescript
export const BACKEND_CONFIG = {
  DEV_URL: 'http://localhost:3001',
  PROD_URL: 'https://clinic-os-backend.onrender.com', // Your Render URL
  ENVIRONMENT: 'production' as 'development' | 'production',
};
```

## Option 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your backend repository
4. Add environment variables (SMTP credentials)
5. Railway will automatically detect Node.js and deploy
6. Copy your deployment URL
7. Update `PROD_URL` in your frontend config

## Option 3: Use Your Public IP (Temporary Solution)

**⚠️ Warning**: This only works if your device is on the same network as your development machine.

### Step 1: Find Your Public IP
Visit [whatismyip.com](https://whatismyip.com) to get your public IP.

### Step 2: Configure Port Forwarding
In your router settings:
- Forward port 3001 to your local machine
- Allow incoming connections on port 3001

### Step 3: Update Config
```typescript
PROD_URL: 'http://YOUR_PUBLIC_IP:3001',
ENVIRONMENT: 'production',
```

**⚠️ Note**: This solution is temporary and requires your computer to be on and your router to allow port forwarding.

## Testing Backend Deployment

Test your deployed backend:

```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.45
}
```

## Troubleshooting

### Issue: Environment variables not found / "SMTP_EMAIL: ❌ NOT SET"
**This is the most common issue!** Follow these steps:

1. **Verify variables are set in Render:**
   - Go to your Render service dashboard
   - Click "Environment" in the left sidebar
   - Check that `SMTP_EMAIL` and `SMTP_APP_PASSWORD` are listed
   - Verify spelling (case-sensitive, no typos)

2. **Check variable values:**
   - Click on each variable to edit and verify the value is correct
   - For `SMTP_EMAIL`: Should be your full Gmail address (e.g., `yourname@gmail.com`)
   - For `SMTP_APP_PASSWORD`: Should be exactly 16 characters, no spaces or quotes

3. **After adding/updating variables, manually redeploy:**
   - Render does NOT automatically redeploy when you add environment variables
   - Go to "Manual Deploy" → "Deploy latest commit"
   - OR click "Events" → "Deploy latest commit"

4. **Verify variable names are exact:**
   - ✅ Correct: `SMTP_EMAIL`, `SMTP_APP_PASSWORD`
   - ❌ Wrong: `SMTP_Email`, `SMTP_APP_PASS`, `smtp_email`, `SMTPEMAIL`

5. **Check deployment logs:**
   - After redeploy, check the logs
   - Look for the "🔍 Environment check:" section
   - If still showing "❌ NOT SET", the variables aren't being passed to the service

### Issue: "Network request failed" in client app
**Solution**: Check that `ENVIRONMENT` is set to `'production'` and `PROD_URL` is correct in your client app configuration.

### Issue: Backend returns 500 error
**Solution**: Check your backend logs for missing environment variables or SMTP configuration issues.

### Issue: OTP emails not sent
**Solution**: Verify that `SMTP_EMAIL` and `SMTP_APP_PASSWORD` are set correctly in your deployment environment. Check the deployment logs for SMTP connection errors.

### Issue: Backend times out
**Solution**: Render free tier instances sleep after 15 minutes of inactivity. Consider upgrading or use Railway/Render paid tier.

## Best Practices

1. **Environment Variables**: Never commit `.env` files to Git
2. **HTTPS**: Use HTTPS in production (Render provides this automatically)
3. **Monitoring**: Set up error monitoring (Sentry, etc.)
4. **Backup**: Keep regular backups of your backend configuration
5. **Testing**: Test backend deployment before using in production

## Quick Reference

- **Development**: `http://localhost:3001`
- **Production**: Update your client app to use the deployed backend URL
- **Environment Variables**: Set in your hosting platform's dashboard

## Next Steps

1. Deploy backend to Render/Railway
2. Get deployment URL
3. Update `PROD_URL` in client app configuration
4. Set `ENVIRONMENT: 'production'` in client app
5. Test OTP functionality with the deployed backend

