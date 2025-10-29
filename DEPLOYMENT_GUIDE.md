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
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3001` (or your configured port)

5. Add Environment Variables:
   - `SMTP_EMAIL`: Your Gmail address
   - `SMTP_APP_PASSWORD`: Your Gmail app password (16 characters)
   - `PORT`: `3001`
   - `NODE_ENV`: `production`

6. Click "Create Web Service"
7. Wait for deployment (about 5-10 minutes)
8. Copy your service URL (e.g., `https://clinic-os-backend.onrender.com`)

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

### Issue: "Network request failed" in client app
**Solution**: Check that `ENVIRONMENT` is set to `'production'` and `PROD_URL` is correct in your client app configuration.

### Issue: Backend returns 500 error
**Solution**: Check your backend logs for missing environment variables or SMTP configuration issues.

### Issue: OTP emails not sent
**Solution**: Verify that `SMTP_EMAIL` and `SMTP_APP_PASSWORD` are set correctly in your deployment environment.

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

